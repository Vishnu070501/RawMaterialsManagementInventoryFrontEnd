export const PageHeader = ({ title, description }) => (
  <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100">
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-amber-800">{title}</h1>
      <p className="text-amber-600 mt-2">{description}</p>
    </div>
  </header>
);
