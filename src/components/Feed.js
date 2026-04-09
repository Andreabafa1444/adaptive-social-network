import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import PostCard from "./PostCard";
import "../styles/feed.css";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

/* =========================
   SAFE SKELETON (NO TOCA POSTCARD)
========================= */

function SkeletonCard(){

  return(

    <div className="post-card skeleton-card">

      <div className="sk-header">

        <div className="sk-avatar sk-shimmer"/>

        <div className="sk-user">

          <div className="sk-line sk-user-line sk-shimmer"/>

          <div className="sk-line sk-date-line sk-shimmer"/>

        </div>

      </div>

      <div className="sk-line sk-title sk-shimmer"/>

      <div className="sk-line sk-text sk-shimmer"/>

      <div className="sk-line sk-text sk-short sk-shimmer"/>

      <div className="sk-image sk-shimmer"/>

      <div className="sk-actions">

        <div className="sk-action sk-shimmer"/>

        <div className="sk-action sk-shimmer"/>

        <div className="sk-action sk-shimmer"/>

      </div>

    </div>

  );

}

/* =========================
   FEED
========================= */

function Feed({ connection, user, loading }) {

  const [posts,setPosts]=useState(null);

  const [firestoreReady,setFirestoreReady]=useState(false);

/* =========================
   FIRESTORE LISTENER
========================= */

  useEffect(()=>{

    if(!user){

      setPosts(null);

      setFirestoreReady(false);

      return;

    }

    const q=query(

      collection(db,"posts"),

      orderBy("createdAt","desc")

    );

    const unsubscribe=onSnapshot(q,(snapshot)=>{

      const safePosts=snapshot.docs.map(d=>{

        const data=d.data();

        return{

          id:d.id,

          title:data.title || "",

          text:data.text || "",

          image:data.image || "",

          likes:data.likes || [],

          savedBy:data.savedBy || [],

          author:data.author || "User",

          createdAt:data.createdAt || null,

          ...data

        };

      });

      setPosts(safePosts);

      setFirestoreReady(true);

    });

    return()=>unsubscribe();

  },[user]);

/* =========================
   LIKE
========================= */

  const toggleLike=async(post)=>{

    if(!user)return;

    const postRef=doc(db,"posts",post.id);

    const hasLiked=post.likes?.includes(user.uid);

    await updateDoc(postRef,{

      likes:hasLiked

      ?arrayRemove(user.uid)

      :arrayUnion(user.uid)

    });

  };

/* =========================
   SAVE
========================= */

  const toggleSave=async(post)=>{

    if(!user)return;

    const postRef=doc(db,"posts",post.id);

    const hasSaved=post.savedBy?.includes(user.uid);

    await updateDoc(postRef,{

      savedBy:hasSaved

      ?arrayRemove(user.uid)

      :arrayUnion(user.uid)

    });

  };

/* =========================
   LOADING STATE
========================= */

  if(

    loading ||

    !firestoreReady ||

    posts===null

  ){

    return(

      <div className="feed-list">

        <SkeletonCard/>

        <SkeletonCard/>

        <SkeletonCard/>

      </div>

    );

  }

/* =========================
   NO USER
========================= */

  if(!user){

    return(

      <div className="feed-loading">

        Por favor inicia sesión

      </div>

    );

  }

/* =========================
   EMPTY
========================= */

  if(posts.length===0){

    return(

      <div className="feed-empty">

        No hay publicaciones todavía

      </div>

    );

  }

/* =========================
   REAL FEED
========================= */

  return(

    <div className="feed-list">

      {posts.map((post,index)=>(

        <PostCard

          key={post.id}

          post={post}

          index={index}

          onLike={toggleLike}

          onSave={toggleSave}

          connection={connection}

        />

      ))}

    </div>

  );

}

export default Feed;