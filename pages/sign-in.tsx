import Header from '@/components/ui/header'

const SignIn = () => {
  return (
    <>
      <Header />

      <main className='flex justify-center'>
        <div className='m-auto flex w-80 max-w-lg flex-col justify-between p-3'>
          <div className='flex flex-col space-y-4'>Sign in</div>
        </div>
      </main>
    </>
  )
}

export default SignIn
