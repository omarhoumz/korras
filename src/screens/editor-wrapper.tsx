import cx from 'classnames'
import { format, isToday } from 'date-fns'
import type { User } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  Firestore,
  onSnapshot,
  QueryDocumentSnapshot,
  setDoc,
  SnapshotOptions,
  updateDoc,
} from 'firebase/firestore'
import { ChangeEvent, useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

import { auth } from '@/lib/firebase/auth'
import { db } from '@/lib/firebase/db'

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

function EntriesManager(
  db: Firestore,
  user: User | null | undefined,
  collectionName: string,
) {
  if (!user) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      addEntry: async () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      updateEntry: async () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      deleteEntry: async () => {},
    }
  }

  const userId = user.uid

  function getEntryDoc(date: string) {
    return doc(db, 'users', userId, collectionName, date)
  }

  async function addEntry(date: string, content: string) {
    return setDoc(getEntryDoc(date), { content })
  }

  async function updateEntry(date: string, content: string) {
    const entryDoc = getEntryDoc(date)
    return updateDoc(entryDoc, { content: content }).catch((error) => {
      if (error.code === 'not-found') {
        addEntry(date, content)
      } else {
        console.log(error.code, ' => ', error.message)
      }
    })
  }

  async function deleteEntry(date: string) {
    return deleteDoc(getEntryDoc(date))
  }

  return { addEntry, updateEntry, deleteEntry, getEntryDoc }
}

export default function EditorScreen() {
  const [user] = useAuthState(auth)
  const entriesManager = EntriesManager(db, user, ENTRIES_COLLECTION)

  const [newEntryDate, setNewEntryDate] = useState<string | undefined>(
    undefined,
  )

  const [entriesFromDb, setEntriesFromDb] = useState<Entries>({})

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>, date: string) {
    // getting the value from the event and formatting it
    const value = event.target.value
    const formattedEntry = addBulletsToEntry(value)

    // updating the entry in the database
    entriesManager.updateEntry(date, formattedEntry)
  }

  async function handleDelete(date: string) {
    await entriesManager.deleteEntry(date)
  }

  function handleAddEntry() {
    if (!newEntryDate) return

    // getting the date in ISO format and content from the local state
    const isoString = new Date(newEntryDate).toISOString()
    const pastEntry = entriesFromDb[isoString]
    const newContent = pastEntry ?? ''

    // adding the new entry to the database
    entriesManager.addEntry(isoString, newContent)

    setNewEntryDate(undefined)
  }

  useEffect(() => {
    let unsubscribe: () => void
    async function getEntries() {
      const q = await collection(
        db,
        'users',
        user?.uid ?? '',
        ENTRIES_COLLECTION,
      ).withConverter(entryConverter)

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newEntries: Entries = {}

        querySnapshot.forEach((doc) => {
          // #172b30
          newEntries[doc.id] = doc.data()
        })

        setEntriesFromDb(newEntries)
      })
    }

    getEntries()

    return () => {
      unsubscribe?.()
    }
  }, [])

  const sortedEntries = Object.entries(entriesFromDb ?? {}).sort(
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
            className='dark-date-input min-w-[300px] rounded border border-slate-200 px-3 py-2 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white'
          />

          <button
            type='button'
            onClick={handleAddEntry}
            className='ml-2 rounded border border-blue-200 bg-blue-600 px-4 py-2 text-white focus:outline-none dark:border-blue-400 dark:bg-blue-400 dark:text-slate-800'
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
                  className='text-sm text-red-500 dark:text-red-400'
                  onClick={() => handleDelete(date)}
                >
                  Delete
                </button>{' '}
                {format(new Date(date), 'EEEE, MMMM do')}
              </div>

              {/* <div>
                <div
                  contentEditable
                  className='min-h-[36px] rounded border px-8 py-4 text-sm leading-relaxed text-slate-700 focus:outline-none [&>*]:list-item [&>*]:list-inside [&>*]:list-disc [&>*]:leading-relaxed'
                  onInput={(e) => {
                    const input = e.target as HTMLElement

                    console.log(input.innerText)
                  }}
                ></div>
              </div> */}

              <textarea
                value={value}
                onChange={(e) => handleChange(e, date)}
                className={cx(
                  'w-full rounded border border-slate-200 bg-transparent p-4 leading-relaxed focus:outline-none dark:border-slate-600',
                  { 'min-h-[400px]': isToday(new Date(date)) },
                )}
                style={{ height: `calc(${numberOfLines * 2}rem + 2rem)` }}
              />
            </div>
          )
        })}
      </main>
    </>
  )
}
