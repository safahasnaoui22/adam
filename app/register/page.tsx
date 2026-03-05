"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  async function handleSubmit(e:any) {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Account created ✅");
    router.push("/login");
  }

  return (
    <div className="h-screen flex items-center justify-center">

      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-96"
      >

        <h1 className="text-2xl font-bold">
          Create Restaurant Account
        </h1>

        <input
          placeholder="Coffee Name"
          onChange={e =>
            setForm({...form,name:e.target.value})
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Email"
          onChange={e =>
            setForm({...form,email:e.target.value})
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Phone"
          onChange={e =>
            setForm({...form,phone:e.target.value})
          }
          className="border p-2 w-full"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e =>
            setForm({...form,password:e.target.value})
          }
          className="border p-2 w-full"
        />

        <button className="bg-black text-white p-2 w-full">
          Register
        </button>

      </form>
    </div>
  );
}