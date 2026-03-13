"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const demos = [
  { label: "Admin", email: "admin@dealerops.local" },
  { label: "Manager", email: "manager@dealerops.local" },
  { label: "Sales", email: "sales@dealerops.local" },
  { label: "Aftersales", email: "aftersales@dealerops.local" },
];

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "Password123!" } });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    setError(null);
    const response = await signIn("credentials", { ...values, redirect: false });
    setLoading(false);
    if (response?.error) {
      setError("Invalid login details.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#164e63_0,#09090b_50%)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/85 p-6 shadow-2xl">
        <h1 className="font-rajdhani text-3xl font-bold text-cyan-300">DealerOps</h1>
        <p className="mt-1 text-sm text-zinc-400">Secure dealer login</p>
        <form className="mt-6 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input placeholder="Email" {...form.register("email")} />
          <Input placeholder="Password" type="password" {...form.register("password")} />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {demos.map((demo) => (
            <Button
              key={demo.email}
              variant="outline"
              size="sm"
              onClick={() => form.reset({ email: demo.email, password: "Password123!" })}
            >
              Demo {demo.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
