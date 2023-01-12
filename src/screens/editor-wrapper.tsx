import { format } from 'date-fns'
import { ChangeEvent, useState } from 'react'

import { useLocalStorage } from '@/lib/use-local-storage'

type Entries = Record<string, string>

export default function EditorScreen() {
  const [newEntryDate, setNewEntryDate] = useState<string>()
  const [entries, setEntries] = useLocalStorage<Entries>('everything')

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>, date: string) {
    setEntries((pastEntries) => {
      return {
        ...pastEntries,
        [date]: event.target.value,
      }
    })
  }

  const sortedEntries = Object.entries(entries ?? {}).sort(
    ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime(),
  )

  function handleAddEntry() {
    if (!newEntryDate) return

    const isoString = new Date(newEntryDate).toISOString()

    setEntries((pastEntries) => {
      return { ...pastEntries, [isoString]: '' }
    })
  }

  function handleDelete(date: string) {
    setEntries((pastEntries) => {
      const newEntries = { ...pastEntries }
      delete newEntries[date]
      return newEntries
    })
  }

  return (
    <>
      <main className='mx-auto h-full max-w-6xl space-y-4 p-4'>
        <div>
          <input
            type='date'
            value={newEntryDate}
            onChange={(e) => setNewEntryDate(e.target.value)}
          />
          <button type='button' onClick={handleAddEntry}>
            Add entry
          </button>
        </div>
        {sortedEntries.map(([date, value]) => {
          return (
            <div key={date}>
              <div className='mb-4 border-b pb-2 text-2xl font-medium'>
                <button
                  className='text-sm text-red-500'
                  onClick={() => handleDelete(date)}
                >
                  Delete
                </button>{' '}
                {format(new Date(date), 'EEEE, MMMM do')}
              </div>

              <textarea
                value={value}
                onChange={(e) => handleChange(e, date)}
                className='min-h-[300px] w-full rounded border border-slate-200 p-4 text-lg leading-relaxed shadow-inner focus:bg-slate-50 focus:outline-none'
              />
            </div>
          )
        })}
      </main>

      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
    </>
  )
}
