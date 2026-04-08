import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, serverTimestamp, increment } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import Swal from "sweetalert2";
import "../styles/post.css";

function normalizeConnection(raw) {
  if (!raw || raw === "4g" || raw === "full" || raw === "fast") return "fast";
  if (raw === "3g" || raw === "limited" || raw === "unstable") return "slow";
  if (raw === "2g" || raw === "slow-2g" || raw === "slow") return "slow";
  if (raw === "offline") return "offline";
  return "fast";
}

function optimizeUnsplashUrl(url, width = 400, quality = 75) {
  if (!url || !url.includes("unsplash.com")) return url;
  const base = url.split("?")[0];
  return `${base}?w=${width}&q=${quality}&auto=format&fit=crop`;
}

function PostCard({ post, index, onLike, onSave, connection }) {

  const [isEditing, setIsEditing]       = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded]     = useState(false);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [showHeart, setShowHeart]       = useState(false);
  const [imgSrc, setImgSrc]             = useState(null);
  const imgContainerRef                 = React.useRef(null);

  const [title, setTitle] = useState(post?.title || "");
  const [text, setText] = useState(post?.text || "");
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  const networkStatus = normalizeConnection(connection);

  const isFast = networkStatus === "fast";
  const isSlow = networkStatus === "slow";
  const isOffline = networkStatus === "offline";

  const isOwner = auth.currentUser?.uid === post.authorId;

  const textToShow = isExpanded ? post.text : post.text?.substring(0,150);

  const isLongText = post.text?.length > 150;

  const networkLabel =
    isFast ? "FAST" :
    isSlow ? "3G / LENTO" :
    "OFFLINE";

  useEffect(()=>{

    if(networkStatus !== "slow" || !post.imageUrl) return;

    const observer = new IntersectionObserver(

      ([entry])=>{

        if(entry.isIntersecting){

          setImgSrc(post.imageUrl);

          observer.disconnect();

        }

      },

      {rootMargin:"400px"}

    );

    const el = imgContainerRef.current;

    if(el) observer.observe(el);

    return ()=>observer.disconnect();

  },[networkStatus,post.imageUrl]);


  useEffect(()=>{

    if(!isOffline && post.id){

      const timer = setTimeout(()=>{

        updateDoc(
          doc(db,"posts",post.id),
          {views:increment(1)}
        ).catch(()=>{});

      },2000);

      return ()=>clearTimeout(timer);

    }

  },[post.id,isOffline]);


  const fetchUnsplash = async(q)=>{

    try{

      const resp = await fetch(

        `https://api.unsplash.com/search/photos?query=${q}&client_id=${process.env.REACT_APP_UNSPLASH_KEY}`

      );

      const data = await resp.json();

      setResults(data.results || []);

    }

    catch(e){

      console.error(e);

    }

  };


  useEffect(()=>{

    if(isEditing && searchQuery.length > 2){

      const timer = setTimeout(()=>{

        fetchUnsplash(searchQuery);

      },500);

      return ()=>clearTimeout(timer);

    }

    else{

      setResults([]);

    }

  },[searchQuery,isEditing]);


  const handleHashtagClick=(tag)=>{

    const cleanTag = tag
      .replace("#","")
      .toLowerCase()
      .trim();

    navigate(`/explore?search=${cleanTag}`);

  };


  const handleDoubleTap=()=>{

    if(isOffline) return;

    onLike(post);

    setShowHeart(true);

    setTimeout(()=>{

      setShowHeart(false);

    },800);

  };


  const handleUpdate = async(e)=>{

    e.preventDefault();

    if(!isOwner) return;

    const tagsArr = tags
      .split(",")
      .map(t=>t.trim().toLowerCase().replace("#",""))
      .filter(t=>t!== "");

    await updateDoc(

      doc(db,"posts",post.id),

      {

        title,
        text,
        tags:tagsArr,
        imageUrl,
        updatedAt:serverTimestamp()

      }

    );

    setIsEditing(false);

    Swal.fire({

      icon:"success",
      title:"¡Actualizado!",
      toast:true,
      position:"top-end",
      timer:2000,
      showConfirmButton:false

    });

  };


  const handleDelete = async()=>{

    setShowDropdown(false);

    if(!isOwner) return;

    const res = await Swal.fire({

      title:"¿Eliminar publicación?",
      text:"No podrás revertir esto",
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor:"#d33",
      cancelButtonColor:"#3085d6",
      confirmButtonText:"Sí, eliminar"

    });

    if(res.isConfirmed){

      await deleteDoc(
        doc(db,"posts",post.id)
      );

    }

  };


  return(

    <div className={`post-card mode-${networkStatus}`}>

      <>
        <div className="post-header-pro">

          <div className="user-avatar-placeholder">

            {post.authorUsername?.charAt(0).toUpperCase()}

          </div>

          <div className="post-user-info">

            <div className="post-username-pro">

              {post.authorUsername}

              <span className="verified-badge">

                ✔

              </span>

              {isOwner && (

                <span style={{fontSize:"12px",color:"#888"}}>

                  (Tú)

                </span>

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


        {post.imageUrl && (

          <div

            ref={imgContainerRef}

            className="image-container"

            onDoubleClick={handleDoubleTap}

            style={{
              position:"relative",
              borderRadius:"15px"
            }}

          >

            {showHeart && (

              <div className="floating-heart">

                ❤️

              </div>

            )}

{(isFast || imgSrc) &&(

<img

src={optimizeUnsplashUrl(

isFast ? post.imageUrl : imgSrc,

350,
isSlow ? 50:70

)}

alt="Contenido"

className="post-image-pro"

width="350"
height="500"

/* 🔥 FIX IMPORTANTE */
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

filter:isSlow?"grayscale(0.4)":"none"

}}

>

</img>

)}

</div>

)}

</>


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