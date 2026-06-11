import React, { useState, useEffect } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import "../styles/post.css";

function normalizeConnection(raw){
  if(!raw || raw==="4g" || raw==="full" || raw==="fast") return "fast";
  if(raw==="3g" || raw==="limited" || raw==="unstable") return "slow";
  if(raw==="2g" || raw==="slow-2g" || raw==="slow") return "slow";
  if(raw==="offline") return "offline";
  return "fast";
}

function optimizeUnsplashUrl(url,width=400,quality=75){
  if(!url || !url.includes("unsplash.com")) return url;
  const base=url.split("?")[0];
  return `${base}?w=${width}&q=${quality}&auto=format&fit=crop`;
}

function PostCard({post,index,onLike,onSave,connection}){

  const [showComments,setShowComments]=useState(false);
  const [isExpanded,setIsExpanded]=useState(false);
  const [isLoaded,setIsLoaded]=useState(false);
  const [showHeart,setShowHeart]=useState(false);
  const [imgSrc,setImgSrc]=useState(null);

  const imgContainerRef=React.useRef(null);
  const navigate=useNavigate();

  const networkStatus=normalizeConnection(connection);
  const isFast=networkStatus==="fast";
  const isSlow=networkStatus==="slow";
  const isOffline=networkStatus==="offline";

  const isOwner=auth.currentUser?.uid===post.authorId;

  const textToShow=isExpanded
    ?post.text
    :post.text?.substring(0,150);
  const isLongText=post.text?.length>150;

  const networkLabel=
    isFast?"FAST":
    isSlow?"3G / LENTO":
    "OFFLINE";

  // FIX 1: campo unificado — Firestore puede guardar "image" o "imageUrl"
  const imageField = post.imageUrl || post.image || null;

  /* lazy image slow network */
  useEffect(()=>{
    // FIX 2: usamos imageField en lugar de post.imageUrl
    if(networkStatus!=="slow" || !imageField) return;

    const observer=new IntersectionObserver(
      ([entry])=>{
        if(entry.isIntersecting){
          setImgSrc(imageField);  // FIX 2: imageField
          observer.disconnect();
        }
      },
      {rootMargin:"400px"}
    );

    const el=imgContainerRef.current;
    if(el) observer.observe(el);

    return()=>observer.disconnect();
  },[networkStatus,imageField]);  // FIX 2: imageField en deps

  // FIX 3: reset imgSrc cuando cambia de modo para evitar estado sucio
  useEffect(()=>{
    if(networkStatus!=="slow"){
      setImgSrc(null);
      setIsLoaded(false);
    }
  },[networkStatus]);

  /* views counter */
  useEffect(()=>{
    if(!isOffline && post.id){
      const timer=setTimeout(()=>{
        updateDoc(
          doc(db,"posts",post.id),
          {views:increment(1)}
        ).catch(()=>{});
      },2000);
      return()=>clearTimeout(timer);
    }
  },[post.id,isOffline]);

  /* double like */
  const handleDoubleTap=()=>{
    if(isOffline) return;
    onLike(post);
    setShowHeart(true);
    setTimeout(()=>{
      setShowHeart(false);
    },800);
  };

  /* =========================
     RETURN UI
  ========================= */

  return(
    <div className={`post-card mode-${networkStatus}`}>

      <div className="post-header-pro">
        <div className="user-avatar-placeholder">
          {post.authorUsername?.charAt(0).toUpperCase()}
        </div>
        <div className="post-user-info">
          <div className="post-username-pro">
            {post.authorUsername}
            <span className="verified-badge">✔</span>
            {isOwner &&(
              <span style={{fontSize:"12px",color:"#888"}}>(Tú)</span>
            )}
          </div>
          <div className="post-timestamp">
            👁️ {post.views || 0} vistas •
            <span className={`network-badge-pill ${networkStatus}`}>
              {networkLabel}
            </span>
          </div>
        </div>
      </div>

      {/* TITLE */}
      {post.title &&(
        <div className="post-title">{post.title}</div>
      )}

      {/* TEXT */}
      {post.text &&(
        <div className="post-text">
          {textToShow}
          {isLongText &&(
            <span
              className="read-more"
              onClick={()=>setIsExpanded(!isExpanded)}
            >
              {isExpanded?" ver menos":"...ver más"}
            </span>
          )}
        </div>
      )}

      {/* IMAGE — FIX 1: usa imageField en lugar de post.imageUrl */}
      {imageField &&(
        <div
          ref={imgContainerRef}
          className="image-container"
          onDoubleClick={handleDoubleTap}
          style={{position:"relative",borderRadius:"15px"}}
        >
          {showHeart &&(
            <div className="floating-heart">❤️</div>
          )}

          {/* FAST: imagen completa inmediata */}
          {isFast &&(
            <img
              src={optimizeUnsplashUrl(imageField,350,70)}
              alt="Contenido"
              className="post-image-pro"
              width="350"
              height="500"
              loading={index===0?"eager":"lazy"}
              fetchPriority={index===0?"high":"auto"}
              decoding="async"
              onLoad={()=>setIsLoaded(true)}
              style={{
                width:"100%",
                display:"block",
                borderRadius:"15px",
                opacity:isLoaded?1:0.5,
                transition:"opacity 0.4s ease",
                filter:"none"
              }}
            />
          )}

          {/* SLOW: skeleton hasta que entra al viewport, luego imagen comprimida + gris */}
          {isSlow &&(
            <>
              {!imgSrc
                ? <div
                    className="sk-image sk-shimmer"
                    style={{width:"100%",height:"220px",borderRadius:"15px"}}
                  />
                : <img
                    src={optimizeUnsplashUrl(imgSrc,350,50)}
                    alt="Contenido"
                    className="post-image-pro"
                    width="350"
                    height="500"
                    loading="lazy"
                    decoding="async"
                    onLoad={()=>setIsLoaded(true)}
                    style={{
                      width:"100%",
                      display:"block",
                      borderRadius:"15px",
                      opacity:isLoaded?1:0.5,
                      transition:"opacity 0.4s ease",
                      filter:"grayscale(0.4)"
                    }}
                  />
              }
            </>
          )}

          {/* OFFLINE: sin imagen */}

        </div>
      )}

      {/* Aviso offline cuando hay imagen pero no hay conexión */}
      {imageField && isOffline &&(
        <div style={{
          background:"#f0f0f0",
          borderRadius:"15px",
          height:"60px",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          color:"#aaa",
          fontSize:"13px",
          marginBottom:"8px"
        }}>
          🖼️ Imagen no disponible sin conexión
        </div>
      )}

      {/* TAGS */}
      {post.tags?.length>0 &&(
        <div className="post-tags">
          {post.tags.map(tag=>(
            <span
              key={tag}
              className="tag"
              onClick={()=>navigate(`/explore?search=${tag}`)}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="post-actions">
        <button onClick={()=>onLike(post)} disabled={isOffline}>
          ❤️ {post.likes?.length || 0}
        </button>
        <button onClick={()=>setShowComments(!showComments)} disabled={isOffline}>
          💬
        </button>
        <button onClick={()=>onSave(post)} disabled={isOffline}>
          🔖
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && !isOffline &&(
        <CommentSection
          postId={post.id}
          connection={connection}
        />
      )}

    </div>
  );
}

export default PostCard;
