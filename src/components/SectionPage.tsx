import Header from './Header';
import Footer from './Footer';

type SectionPageProps = {
  title: string;
  description: string;
};

const SectionPage = ({ title, description }: SectionPageProps) => (
  <div className='flex min-h-screen flex-col bg-[#f4f7fb] font-pt-sans text-slate-800 antialiased'>
    <Header />
    <main className='mx-auto flex w-full max-w-[1600px] flex-1 items-start px-5 py-10 sm:px-8 lg:px-10'>
      <section className='w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
        <p className='text-xs font-semibold uppercase tracking-[0.16em] text-tj-blue'>
          Sistem Manajemen Armada
        </p>
        <h1 className='mt-2 text-2xl font-bold tracking-tight text-tj-ink'>{title}</h1>
        <p className='mt-2 text-sm text-slate-500'>{description}</p>
        <p className='mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500'>
          Halaman ini sudah terhubung ke navigasi. Fitur dan data untuk bagian ini belum tersedia.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default SectionPage;
