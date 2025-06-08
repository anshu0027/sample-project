import { redirect } from "next/navigation";

export default function Page() {
    redirect("/admin/create-quote/step1");
    return null;
} 