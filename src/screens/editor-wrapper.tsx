import { format } from 'date-fns'
import { ChangeEvent, useState } from 'react'

import { useLocalStorage } from '@/lib/use-local-storage'

type Entries = Record<string, string>

function addBulletsToEntry(entry: string) {
  const newEntry = entry
    .split('\n')
    .map((line) =>
      line.startsWith('• ') ? line : line === '•' ? '' : `• ${line}`,
    )
    .join('\n')

  return newEntry
}

export default function EditorScreen() {
  const [newEntryDate, setNewEntryDate] = useState<string | undefined>(
    undefined,
  )
  const [entries, setEntries] = useLocalStorage<Entries>('everything')

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>, date: string) {
    const value = event.target.value

    const formattedEntry = addBulletsToEntry(value)

    setEntries((pastEntries) => {
      return { ...pastEntries, [date]: formattedEntry }
    })
  }

  const sortedEntries = Object.entries(entries ?? {}).sort(
    ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime(),
  )

  function handleAddEntry() {
    if (!newEntryDate) return

    const isoString = new Date(newEntryDate).toISOString()

    setEntries((pastEntries) => {
      const pastEntry = pastEntries[isoString]
      return { ...pastEntries, [isoString]: pastEntry ?? '' }
    })
    setNewEntryDate(undefined)
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
        <div className='mb-6'>
          <input
            type='date'
            value={newEntryDate}
            onChange={(e) => setNewEntryDate(e.target.value)}
            className='min-w-[300px] rounded border border-slate-200 px-3 py-2 focus:outline-none'
          />
          <button
            type='button'
            onClick={handleAddEntry}
            className='ml-2 rounded border border-blue-200 bg-blue-600 px-4 py-2 text-white focus:outline-none'
          >
            Add entry
          </button>
        </div>

        {sortedEntries.map(([date, value]) => {
          const numberOfLines = value.split('\n').length

          return (
            <div key={date}>
              <div className='pb-4 text-2xl font-medium'>
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
                className='min-h-[200px] w-full rounded border border-slate-200 p-4 text-lg leading-relaxed focus:outline-none'
                style={{ height: `calc(${numberOfLines * 2}rem + 2rem)` }}
              />
            </div>
          )
        })}
      </main>
    </>
  )
}
