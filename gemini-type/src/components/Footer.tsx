'use client'

const Footer = () => {
  return (
    <footer className="flex justify-between items-center p-4 text-gray-500">
      <div className="flex items-center space-x-4">
        <a href="#" className="hover:text-white">contact</a>
        <a href="#" className="hover:text-white">support</a>
        <a href="#" className="hover:text-white">github</a>
        <a href="#" className="hover:text-white">discord</a>
        <a href="#" className="hover:text-white">twitter</a>
      </div>
      <div className="flex items-center space-x-4">
        <a href="#" className="hover:text-white">terms</a>
        <a href="#" className="hover:text-white">security</a>
        <a href="#" className="hover:text-white">privacy</a>
      </div>
    </footer>
  )
}

export default Footer
