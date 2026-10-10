
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Sesion = {
  roles?: number[]
}

function CambiarPerfilButton() {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    let activo = true

    const cargarSesion = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/auth/sesion/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          return
        }

        const sesion = (await response.json()) as Sesion

        if (activo) {
          setMostrar(
            (sesion.roles ?? []).length > 1,
          )
        }
      } catch {
        if (activo) {
          setMostrar(false)
        }
      }
    }

    void cargarSesion()

    return () => {
      activo = false
    }
  }, [])

  if (!mostrar) {
    return null
  }

  return (
    <Link
      to="/seleccionar-perfil"
      className="cambiar-perfil-boton"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '48px',
        padding: '12px 22px',
        background: 'rgba(215, 172, 50, 0.22)',
        color: '#f8e8b4',
        border: '1.5px solid #d7ac32',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: 700,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#d7ac32'
        e.currentTarget.style.color = '#102419'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          'rgba(215, 172, 50, 0.22)'
        e.currentTarget.style.color = '#f8e8b4'
      }}
    >
      ← Cambiar perfil
    </Link>
  )
}

export default CambiarPerfilButton
