import { Link } from 'react-router-dom'

export default function PublicHeader() {
  return (
    <header className='flex w-full items-center justify-between border-b border-blue-600 bg-blue-50 px-8 py-2'>
      <Link to='/' className='no-underline'>
        <div className='font-inter cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text py-2 text-2xl font-bold leading-7 tracking-wide text-transparent'>
          VERDAD
        </div>
      </Link>
    </header>
  )
}
