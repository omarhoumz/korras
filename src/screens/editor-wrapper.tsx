import { format } from 'date-fns'
import type {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { ChangeEvent, useEffect, useState } from 'react'

import { db } from '@/lib/firebase/db'
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

const entryConverter = {
  toFirestore: (entry: string) => {
    return { content: entry }
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions,
  ) => {
    const data = snapshot.data(options)
    return data.content
  },
}

const ENTRIES_COLLECTION = 'entries'

export default function EditorScreen() {
  const [newEntryDate, setNewEntryDate] = useState<string | undefined>(
    undefined,
  )
  const [entries, setEntries] = useLocalStorage<Entries>('everything')

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>, date: string) {
    // getting the value from the event and formatting it
    const value = event.target.value
    const formattedEntry = addBulletsToEntry(value)

    // updating the entry in the database
    const entriesCollection = doc(db, ENTRIES_COLLECTION, date)
    updateDoc(entriesCollection, { content: formattedEntry })

    // updating the entry in the local state
    setEntries((pastEntries) => {
      return { ...pastEntries, [date]: formattedEntry }
    })
  }

  async function handleDelete(date: string) {
    await deleteDoc(doc(db, ENTRIES_COLLECTION, date))

    setEntries((pastEntries) => {
      const newEntries = { ...pastEntries }
      delete newEntries[date]
      return newEntries
    })
  }

  function handleAddEntry() {
    if (!newEntryDate) return

    // getting the date in ISO format and content from the local state
    const isoString = new Date(newEntryDate).toISOString()
    const pastEntry = entries[isoString]
    const newContent = pastEntry ?? ''

    // adding the new entry to the database
    const entriesCollection = doc(db, ENTRIES_COLLECTION, isoString)
    setDoc(entriesCollection, { content: newContent })

    // adding the new entry to the local state
    setEntries((pastEntries) => {
      return { ...pastEntries, [isoString]: newContent }
    })

    setNewEntryDate(undefined)
  }

  useEffect(() => {
    let unsubscribe: () => void
    async function getEntries() {
      const q = await collection(db, ENTRIES_COLLECTION).withConverter(
        entryConverter,
      )

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'

          console.log(source, ' || ', doc.id, ' => ', doc.data())
        })
      })
    }

    getEntries()

    return () => {
      unsubscribe?.()
    }
  }, [])

  const sortedEntries = Object.entries(entries ?? {}).sort(
    ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime(),
  )

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
