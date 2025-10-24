import React from "react";

function App() {
  const task = [
    {
      title : 'Calculus Class',
      description : 'Attending the Calculus Class at K.106',
      date : '27 October 2025',
      time : '10.00 PM',
      status : 'Active',
    },
    {
      title : 'Physics Class',
      description : 'Attending the Physics Class at K.202',
      date : '27 October 2025',
      time : '13.00 AM',
      status : 'Active',
    },
    {
      title : 'Practical Class',
      description : 'Attending the Practical Class at Lab. I-CELL FL. 07D',
      date : '28 October 2025',
      time : '13.00 AM',
      status : 'Active',
    }
  ];

  const divArray = [];

  for (let i = 0; i < task.length; i++){
    let currentTask = task[i];
    divArray.push(
      <div className='bg-slate-700 p-4 rounded-2xl shadow-lg felx-col'>
      <p className='font-semibold text-2xl'>
        {currentTask.title}
      </p>
      <details>
        <summary>More Details</summary>
      <p className='text-base'>
        {currentTask.description}
      </p>
      <p className=' text-base'>
        {currentTask.date}
      </p>
      <p className=' text-base'>
        {currentTask.time}
      </p>
      <p className=' text-base'>
        {currentTask.status}
      </p>
      <input type = "checkbox"/>
      </details>
      </div>
    )
  }
  
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
            {divArray}
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}

export default App
