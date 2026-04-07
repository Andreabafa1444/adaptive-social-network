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

function Feed({ connection, user, loading }) {

  const [posts, setPosts] = useState([]);

  useEffect(()=>{

    if(!user){
      setPosts([]);
      return;
    }

    const q = query(
      collection(db,"posts"),
      orderBy("createdAt","desc")
    );

    const unsubscribe = onSnapshot(q,(snapshot)=>{

      setPosts(
        snapshot.docs.map(doc=>({
          id:doc.id,
          ...doc.data()
        }))
      );

    });

    return ()=>unsubscribe();

  },[user]);


  const toggleLike = async(post)=>{

    if(!user) return;

    const postRef = doc(db,"posts",post.id);

    const hasLiked = post.likes?.includes(user.uid);

    await updateDoc(postRef,{
      likes: hasLiked
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid)
    });

  };


  const toggleSave = async(post)=>{

    if(!user) return;

    const postRef = doc(db,"posts",post.id);

    const hasSaved = post.savedBy?.includes(user.uid);

    await updateDoc(postRef,{
      savedBy: hasSaved
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid)
    });

  };


  if(loading){

    return (
      <div className="feed-loading">
        Restaurando sesión...
      </div>
    );
  
  }
  
  if(!user){
  
    return (
      <div className="feed-loading">
        Por favor inicia sesión
      </div>
    );
  
  }


  return (

    <div className="feed-list">

      {posts.length===0 ? (

        <div className="feed-empty">
          No hay publicaciones todavía
        </div>

      ):(
        
        posts.map((post,index)=>(

          <PostCard
            key={post.id}
            post={post}
            index={index}
            onLike={toggleLike}
            onSave={toggleSave}
            connection={connection}
          />

        ))

      )}

    </div>

  );

}

export default Feed;