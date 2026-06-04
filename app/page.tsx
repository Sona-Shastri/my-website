import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <main className="container">
        <div className="avatar" />
        <h1>Sona Shastri</h1>
        <p className="role">Software Engineer</p>
        <p className="bio">
          Hi, I&apos;m Sona — I&apos;m a dancer who loves traveling, hanging out with
          friends, going to the pool, and eating good food. I built this website
          myself, and I&apos;m excited to learn more about building websites and what
          AI can do!
        </p>
        <Link className="cta" href="/login">
          Members Login 🔒
        </Link>
      </main>
    </section>
  );
}
