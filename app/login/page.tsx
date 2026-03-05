"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {

  const router = useRouter();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  async function login(e:any){
    e.preventDefault();

    const res = await signIn("credentials",{
      email,
      password,
      redirect:false
    });

    if(res?.error){
      alert("Login failed");
      return;
    }

    router.push("/dashboard");
  }

  return(
    <div className="h-screen flex justify-center items-center">

      <form onSubmit={login} className="space-y-4 w-96">

        <h1 className="text-2xl font-bold">
          Owner Login
        </h1>

        <input
          placeholder="Email"
          onChange={e=>setEmail(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e=>setPassword(e.target.value)}
          className="border p-2 w-full"
        />

        <button className="bg-black text-white p-2 w-full">
          Login
        </button>

      </form>
    </div>
  );
}