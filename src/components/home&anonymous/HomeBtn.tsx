import { Home } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function HomeBtn() {

  return (
    <Link href='/' className='fixed top-4 right-4'>
        <Button className='bg-baground text-background-foreground '>
            <Home className='w-5 h-5'/>
        </Button>
    </Link>
  )
}

export default HomeBtn