import { redirect } from "next/navigation";
// import router from "next/router";

export default function Home() {
  redirect("/customer/quote-generator");
  // router.replace("/customer/quote-generator");
  return null;
}
