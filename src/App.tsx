import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
  return (
    <div className="flex min-h-screen min-w-[320px] flex-col bg-[#f2f4f7] font-pt-sans text-[#243247] antialiased">
      <Header />
      <main className="mx-auto w-[calc(100%-3rem)] max-w-7xl flex-1 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-tj-ink">
          Hello world!!
        </h1>
      </main>
      <Footer />
    </div>
  );
}

export default App;
