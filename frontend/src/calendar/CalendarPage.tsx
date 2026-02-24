import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../auth/apiClient'
import { useAuth } from '../auth/AuthContext'

type DrinkType = { id: number; name: string }

export function CalendarPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([])

  useEffect(() => {
    apiClient
      .get<DrinkType[]>('/drink-types')
      .then(r => setDrinkTypes(r.data))
      .catch(() => {
        // silent; оставим страницу без списка, если что-то пошло не так
      })
  }, [])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ fontFamily: 'system-ui', minHeight: '100vh', background: 'radial-gradient(circle at top,#0f172a,#020617)', color: 'white' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(148,163,184,0.25)' }}>
        <div>
          <div style={{ fontWeight: 700 }}>AlcoCalendar</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Фаза 1: Авторизация и базовая модель</div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: 999,
            border: '1px solid rgba(148,163,184,0.6)',
            background: 'transparent',
            color: '#e5e7eb',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Выйти
        </button>
      </header>

      <main style={{ padding: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 16,
            background: 'linear-gradient(135deg,rgba(56,189,248,0.2),rgba(59,130,246,0.15))',
            border: '1px solid rgba(59,130,246,0.5)',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Добро пожаловать!</h2>
          <p style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>
            Вы на защищённой странице. Авторизация, JWT и базовые справочники уже работают — можно переходить к дальнейшему развитию.
          </p>
        </section>

        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: 16,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(31,41,55,0.9)',
          }}
        >
          <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Типы напитков (seed из БД)</h3>
          {drinkTypes.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Загружаем список типов напитков…</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {drinkTypes.map(d => (
                <li
                  key={d.id}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 999,
                    background: 'rgba(148,163,184,0.12)',
                    border: '1px solid rgba(148,163,184,0.4)',
                    fontSize: '0.8rem',
                  }}
                >
                  {d.name}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

