import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, serverTimestamp, increment } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import Swal from "sweetalert2";
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

/* lazy image slow network */

useEffect(()=>{

if(networkStatus!=="slow" || !post.imageUrl) return;

const observer=new IntersectionObserver(

([entry])=>{

if(entry.isIntersecting){

setImgSrc(post.imageUrl);

observer.disconnect();

}

},

{rootMargin:"400px"}

);

const el=imgContainerRef.current;

if(el) observer.observe(el);

return()=>observer.disconnect();

},[networkStatus,post.imageUrl]);

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

<span className="verified-badge">

✔

</span>

{isOwner &&(

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

{/* TITLE */}

{post.title &&(

<div className="post-title">

{post.title}

</div>

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

{/* IMAGE */}

{post.imageUrl &&(

<div

ref={imgContainerRef}

className="image-container"

onDoubleClick={handleDoubleTap}

style={{

position:"relative",

borderRadius:"15px"

}}

>

{showHeart &&(

<div className="floating-heart">

❤️

</div>

)}

{(isFast || imgSrc)&&(

<img

src={optimizeUnsplashUrl(

isFast?post.imageUrl:imgSrc,

350,

isSlow?50:70

)}

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

filter:isSlow?"grayscale(0.4)":"none"

}}

>

</img>

)}

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

<button

onClick={()=>onLike(post)}

disabled={isOffline}

>

❤️ {post.likes?.length || 0}

</button>

<button

onClick={()=>setShowComments(!showComments)}

disabled={isOffline}

>

💬

</button>

<button

onClick={()=>onSave(post)}

disabled={isOffline}

>

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