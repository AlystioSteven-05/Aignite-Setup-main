import React from "react";

function App() {
  return (
    <div className='flex justify-center w-full min-h-screen bg-gray-800 text-white' >
      <header className='absolute top-0 text-xl p-5 bg-gray-600 w-full text-center rounded-lg'>
      To-Do The List App
      </header>
      <main className='pt-36 w-3/4'>
      {/* User Prompt */}
      <div className='flex justify-center'>
        <input className='bg-slate-700 p-4 rounded-2xl w-3/4 shadow-md' placeholder='Type Your List'>
        </input>
        <button className='pl-2 h-12 pt-2'>
          <img src={('logo192.png')} alt='enter' className='w-full h-full'/>
        </button>
      </div>

      {/* Spacing */}
      <div className='p-6/'>

      {/* To-Do The List */}
      <div className='flex justify-center p-6'>
        <div className='w-[85%] flex flex-col gap-y-4'>
          <p className='font-semibold text-xl'> Your To-Do List </p>
          <hr/>

          {/* Card 1 */}
          <div className='bg-slate-700 p-4 rounded-2xl shadow-lg felx-col'>
            <p className='font-semibold text-2xl'>
              Crossing the Road
            </p>
            <p className='text-base'>
              Why did the Steven Cross the Road?
            </p>
            <p className=' text-base'>
              Date: 30 Februari 2025.
            </p>
            <p className=' text-base'>
              Time: 11.00 PM
            </p>
            <p className=' text-base'>
              Status: Active
            </p>
          </div>

          {/* Card 2 */}
          <div className='bg-slate-700 p-4 rounded-2xl shadow-lg felx-col'>
            <p className='font-semibold text-2xl'>
              Cleaning the House
            </p>
            <p className='text-base'>
              Why did the Steven Clean the House
            </p>
            <p className=' text-base'>
              Date: 30 Februari 2025.
            </p>
            <p className=' text-base'>
              Time: 10.00 PM
            </p>
            <p className=' text-base'>
              Status: Active
            </p>
          </div>
        </div>
      </div>

      </div>

      </main>
  </div>
  )
}

export default App