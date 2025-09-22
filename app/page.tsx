import { redirect } from 'next/navigation';

export default function Home() {
    // server-side redirect to /dashboard
    redirect('/dashboard');
}
