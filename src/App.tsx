import { useState } from 'react'
import { TodoForm } from './components/forms/todo-form'
import { FirstForm } from './components/forms/first-form'
import { SecondForm } from './components/forms/second-form'
import { EventForm } from './components/forms/event-form'
import './App.css'

const forms = {
  todo: { label: 'Todo Form', component: <TodoForm /> },
  first: { label: 'First Form', component: <FirstForm /> },
  second: { label: 'Second Form', component: <SecondForm /> },
  event: { label: 'Event Form', component: <EventForm /> },
} as const

type FormType = keyof typeof forms

function App() {
  const [activeForm, setActiveForm] = useState<FormType>('event')

  return (
    <div>
      <header className="topbar">
        <nav className="tabs">
          {Object.entries(forms).map(([key, { label }]) => {
            const isActive = key === activeForm

            return (
              <button
                key={key}
                onClick={() => setActiveForm(key as FormType)}
                className={`tab ${isActive ? 'active' : ''}`}
              >
                {label}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="content">{forms[activeForm]?.component}</main>
    </div>
  )
}

export default App
