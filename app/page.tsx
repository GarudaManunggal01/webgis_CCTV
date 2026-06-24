import Map from "./components/Map";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col">
      <header className="h-25 bg-gray-900 shadow flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-3xl font-bold text-white text center">
      PANTAU JOGJA
    </h1>
    <p className="text-sm text-gray-300">
      Smart Monitoring for Smart City 👀
    </p>
  </div>
</header>
      <div className="flex-1">
        <Map />
      </div>
    </main>
  );
}
