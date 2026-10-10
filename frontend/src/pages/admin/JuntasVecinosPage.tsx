
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type JuntaVecinos = {
  id: number
  nombre: string
  comuna: string
  descripcion: string | null
  activa: boolean
  fecha_creacion: string
}

const COMUNAS_RM = [
  'Alhué',
  'Buin',
  'Calera de Tango',
  'Cerrillos',
  'Cerro Navia',
  'Colina',
  'Conchalí',
  'Curacaví',
  'El Bosque',
  'El Monte',
  'Estación Central',
  'Huechuraba',
  'Independencia',
  'Isla de Maipo',
  'La Cisterna',
  'La Florida',
  'La Granja',
  'La Pintana',
  'La Reina',
  'Lampa',
  'Las Condes',
  'Lo Barnechea',
  'Lo Espejo',
  'Lo Prado',
  'Macul',
  'Maipú',
  'María Pinto',
  'Melipilla',
  'Ñuñoa',
  'Padre Hurtado',
  'Paine',
  'Pedro Aguirre Cerda',
  'Peñaflor',
  'Peñalolén',
  'Pirque',
  'Providencia',
  'Pudahuel',
  'Puente Alto',
  'Quilicura',
  'Quinta Normal',
  'Recoleta',
  'Renca',
  'San Bernardo',
  'San Joaquín',
  'San José de Maipo',
  'San Miguel',
  'San Pedro',
  'San Ramón',
  'Santiago',
  'Talagante',
  'Tiltil',
  'Vitacura',
] as const

function JuntasVecinosPage() {
  const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nombre, setNombre] = useState('')
  const [comuna, setComuna] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [juntaEditando, setJuntaEditando] =
    useState<JuntaVecinos | null>(null)

  useEffect(() => {
    const cargarJuntas = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/organizacion/juntas/',
          {
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible cargar las juntas de vecinos.'
          )
        }

        const data = await response.json()
        setJuntas(data)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Ocurrió un error inesperado.'
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarJuntas()
  }, [])

  const crearJunta = async (event: FormEvent) => {
    event.preventDefault()
    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      const response = await fetch(
        'http://localhost:8000/api/organizacion/juntas/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            nombre,
            comuna,
            descripcion,
            activa: true,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'No fue posible crear la junta de vecinos.'
        )
      }

      setJuntas((actuales) => [...actuales, data])
      setNombre('')
      setComuna('')
      setDescripcion('')
      setMensaje('Junta de vecinos creada correctamente.')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setGuardando(false)
    }
  }

  const comenzarEdicion = (junta: JuntaVecinos) => {
    setJuntaEditando(junta)
    setNombre(junta.nombre)
    setComuna(junta.comuna)
    setDescripcion(junta.descripcion ?? '')
    setMensaje('')
    setError('')
  }

  const cancelarEdicion = () => {
    setJuntaEditando(null)
    setNombre('')
    setComuna('')
    setDescripcion('')
    setError('')
    setMensaje('')
  }

  const actualizarJunta = async () => {
    if (!juntaEditando) return

    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/juntas/${juntaEditando.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            nombre,
            comuna,
            descripcion,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'No fue posible actualizar la junta de vecinos.'
        )
      }

      setJuntas((actuales) =>
        actuales.map((junta) =>
          junta.id === data.id ? data : junta
        )
      )

      setJuntaEditando(null)
      setNombre('')
      setComuna('')
      setDescripcion('')
      setMensaje('Junta de vecinos actualizada correctamente.')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      )
    } finally {
      setGuardando(false)
    }
  }

  const juntasActivas =
    juntas.filter((junta) => junta.activa).length

  const juntasInactivas =
    juntas.length - juntasActivas

  const comunasConJuntas = new Set(
    juntas.map((junta) => junta.comuna)
  ).size

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      dateStyle: 'medium',
    })
  }

  return (
    <main className="juntas-bosque min-h-screen px-4 py-8">
      <style>{`
        .juntas-bosque {
          --jv-oro: #d7ac32;
          --jv-crema: #f6efd9;
          --jv-suave: #d0d4c7;
          --jv-verde: #092318;

          min-height: 100vh;
          color: var(--jv-crema);
          font-family: 'Segoe UI', Arial, sans-serif;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/casitas.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .juntas-bosque,
        .juntas-bosque * {
          box-sizing: border-box;
        }

        .juntas-bosque .jb-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        .juntas-bosque .jb-panel {
          background: rgba(8, 29, 19, 0.77);
          border: 1px solid rgba(215, 172, 50, 0.3);
          border-radius: 23px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.16);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .juntas-bosque h1,
        .juntas-bosque h2,
        .juntas-bosque h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--jv-crema);
          line-height: 1.2;
        }

        .juntas-bosque .jb-header {
          padding: 30px;
          margin-bottom: 26px;
        }

        .juntas-bosque .jb-header-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .juntas-bosque .jb-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .juntas-bosque .jb-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 42px);
          font-weight: 700;
        }

        .juntas-bosque .jb-subtitle {
          margin: 0;
          color: var(--jv-suave);
          font-size: 16px;
          line-height: 1.7;
        }

        .juntas-bosque .jb-badge {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 6px 15px;
          border-radius: 999px;
          border: 1px solid rgba(215, 172, 50, 0.48);
          background: rgba(215, 172, 50, 0.13);
          color: #e9c454;
          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
        }

        .juntas-bosque .jb-badge-green {
          color: #a6eac4;
          border-color: rgba(80, 183, 125, 0.5);
          background: rgba(28, 125, 78, 0.2);
        }

        .juntas-bosque .jb-badge-muted {
          color: #e6e9df;
          border-color: rgba(220, 220, 200, 0.25);
          background: rgba(230, 230, 210, 0.08);
        }

        .juntas-bosque .jb-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 22px;
          min-height: 45px;
          border: 1px solid rgba(215, 172, 50, 0.65);
          border-radius: 15px;
          background: rgba(7, 26, 17, 0.6);
          color: var(--jv-crema);
          font: inherit;
          font-weight: 650;
          text-decoration: none;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .juntas-bosque .jb-button:hover {
          background: rgba(215, 172, 50, 0.2);
          border-color: #e9c454;
        }

        .juntas-bosque .jb-button-primary {
          background: linear-gradient(115deg, #e4c55b, #c49a28);
          border-color: #d7ac32;
          color: #102419;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .juntas-bosque .jb-button-primary:hover {
          background: linear-gradient(115deg, #f0d67c, #dfb646);
          color: #102419;
        }

        .juntas-bosque .jb-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .juntas-bosque .jb-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .juntas-bosque .jb-stat {
          padding: 23px 25px;
          transition: transform 0.2s, background 0.2s;
        }

        .juntas-bosque .jb-stat:hover {
          transform: translateY(-3px);
          background: rgba(12, 43, 26, 0.85);
        }

        .juntas-bosque .jb-stat-label {
          margin: 0 0 15px;
          color: #d1d6c7;
          font-size: 15px;
          font-weight: 600;
        }

        .juntas-bosque .jb-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .juntas-bosque .jb-stat-number {
          color: var(--jv-oro);
          font-size: 35px;
          line-height: 1;
          font-weight: 800;
        }

        .juntas-bosque .jb-alert {
          margin-bottom: 24px;
          padding: 15px 19px;
          border-radius: 13px;
          font-size: 15px;
        }

        .juntas-bosque .jb-alert-error {
          background: rgba(118, 33, 35, 0.84);
          border: 1px solid rgba(231, 104, 104, 0.5);
          color: #ffe4e4;
        }

        .juntas-bosque .jb-alert-success {
          background: rgba(18, 93, 57, 0.8);
          border: 1px solid rgba(102, 201, 140, 0.45);
          color: #dbffe6;
        }

        .juntas-bosque .jb-form-panel {
          margin-bottom: 32px;
          overflow: hidden;
        }

        .juntas-bosque .jb-form-header {
          padding: 26px 30px;
          border-bottom: 1px solid rgba(215, 172, 50, 0.2);
        }

        .juntas-bosque .jb-form-title {
          margin: 0;
          font-size: clamp(25px, 2.5vw, 33px);
        }

        .juntas-bosque .jb-form-body {
          padding: 30px;
        }

        .juntas-bosque .jb-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .juntas-bosque .jb-field-full {
          grid-column: 1 / -1;
        }

        .juntas-bosque .jb-label {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-bottom: 10px;
          color: #f0eddf;
          font-size: 15px;
          font-weight: 650;
        }

        .juntas-bosque .jb-required {
          color: #f0b3a3;
          font-weight: 400;
        }

        .juntas-bosque .jb-optional {
          color: #b6c0b3;
          font-weight: 400;
        }

        .juntas-bosque .jb-input {
          width: 100%;
          min-height: 50px;
          padding: 12px 16px;
          border: 1px solid rgba(215, 172, 50, 0.33);
          border-radius: 13px;
          background: rgba(3, 20, 12, 0.67);
          color: #f7f1df;
          font: inherit;
          font-size: 15px;
          outline: none;
        }

        .juntas-bosque .jb-input::placeholder {
          color: #aab8aa;
          opacity: 1;
        }

        .juntas-bosque .jb-input:focus {
          border-color: #e8c657;
          box-shadow: 0 0 0 3px rgba(215, 172, 50, 0.15);
        }

        .juntas-bosque select.jb-input {
          cursor: pointer;
          color-scheme: dark;
        }

        .juntas-bosque .jb-input option {
          background: #102b1d;
          color: #f7f1df;
        }

        .juntas-bosque textarea.jb-input {
          min-height: 145px;
          resize: vertical;
        }

        .juntas-bosque .jb-counter {
          margin-top: 8px;
          color: #acb8a9;
          font-size: 12px;
          text-align: right;
        }

        .juntas-bosque .jb-form-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(215, 172, 50, 0.2);
        }

        .juntas-bosque .jb-section-heading {
          margin: 0 0 18px;
          font-size: 30px;
        }

        .juntas-bosque .jb-list-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 18px;
        }

        .juntas-bosque .jb-empty {
          padding: 55px 25px;
          text-align: center;
        }

        .juntas-bosque .jb-empty-icon {
          display: grid;
          place-items: center;
          width: 68px;
          height: 68px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: rgba(215, 172, 50, 0.16);
          color: #e9c454;
          font-size: 26px;
          font-weight: 800;
        }

        .juntas-bosque .jb-empty h3 {
          margin: 0 0 12px;
          font-size: 23px;
        }

        .juntas-bosque .jb-empty p {
          max-width: 470px;
          margin: 0 auto;
          color: #cbd2c4;
          line-height: 1.7;
        }

        .juntas-bosque .jb-table-scroll {
          overflow-x: auto;
          border-radius: 23px;
        }

        .juntas-bosque .jb-table {
          width: 100%;
          border-collapse: collapse;
          color: #f1eddf;
          font-size: 14px;
        }

        .juntas-bosque .jb-table thead {
          background: rgba(215, 172, 50, 0.13);
        }

        .juntas-bosque .jb-table th {
          padding: 18px;
          color: #ebce70;
          text-align: left;
          font-weight: 700;
          white-space: nowrap;
        }

        .juntas-bosque .jb-table td {
          padding: 18px;
          border-top: 1px solid rgba(215, 172, 50, 0.15);
          vertical-align: middle;
        }

        .juntas-bosque .jb-table tbody tr:hover {
          background: rgba(215, 172, 50, 0.07);
        }

        .juntas-bosque .jb-avatar {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 13px;
          background: rgba(215, 172, 50, 0.17);
          color: #e9c454;
          font-weight: 800;
          font-size: 17px;
        }

        .juntas-bosque .jb-muted {
          color: #bfcbbe;
        }

        .juntas-bosque .jb-loading {
          padding: 45px;
          text-align: center;
          color: #ebce70;
        }

        .juntas-bosque button:focus-visible,
        .juntas-bosque a:focus-visible,
        .juntas-bosque .jb-input:focus-visible {
          outline: 2px solid #e8c657;
          outline-offset: 3px;
        }

        @media (max-width: 1050px) {
          .juntas-bosque .jb-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .juntas-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .juntas-bosque .jb-header,
          .juntas-bosque .jb-form-header,
          .juntas-bosque .jb-form-body {
            padding: 22px;
          }

          .juntas-bosque .jb-fields {
            grid-template-columns: 1fr;
          }

          .juntas-bosque .jb-stats {
            gap: 12px;
          }

          .juntas-bosque .jb-stat {
            padding: 18px;
          }

          .juntas-bosque .jb-stat-number {
            font-size: 30px;
          }
        }

        @media (max-width: 420px) {
          .juntas-bosque .jb-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="jb-container">

        {/* ENCABEZADO */}

        <div className="jb-panel jb-header">
          <div className="jb-header-row">
            <div>
              <div className="jb-title-row">
                <h1 className="jb-title">
                  Juntas de Vecinos
                </h1>

                <span className="jb-badge">
                  Administración
                </span>
              </div>

              <p className="jb-subtitle">
                Administra las Juntas de Vecinos registradas
                en la plataforma y su información territorial.
              </p>
            </div>

            <Link
              to="/admin"
              className="jb-button"
            >
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* MENSAJES */}

        {mensaje && (
          <div
            className="jb-alert jb-alert-success"
            role="status"
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            className="jb-alert jb-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ESTADÍSTICAS */}

        {!cargando && (
          <div className="jb-stats">

            <div className="jb-panel jb-stat">
              <p className="jb-stat-label">
                Total juntas
              </p>
              <div className="jb-stat-bottom">
                <span className="jb-stat-number">
                  {juntas.length}
                </span>
                <span className="jb-badge">
                  Registradas
                </span>
              </div>
            </div>

            <div className="jb-panel jb-stat">
              <p className="jb-stat-label">
                Activas
              </p>
              <div className="jb-stat-bottom">
                <span className="jb-stat-number">
                  {juntasActivas}
                </span>
                <span className="jb-badge jb-badge-green">
                  Activas
                </span>
              </div>
            </div>

            <div className="jb-panel jb-stat">
              <p className="jb-stat-label">
                Inactivas
              </p>
              <div className="jb-stat-bottom">
                <span className="jb-stat-number">
                  {juntasInactivas}
                </span>
                <span className="jb-badge jb-badge-muted">
                  Inactivas
                </span>
              </div>
            </div>

            <div className="jb-panel jb-stat">
              <p className="jb-stat-label">
                Comunas con juntas
              </p>
              <div className="jb-stat-bottom">
                <span className="jb-stat-number">
                  {comunasConJuntas}
                </span>
                <span className="jb-badge">
                  Comunas
                </span>
              </div>
            </div>

          </div>
        )}

        {/* FORMULARIO DE CREACIÓN Y EDICIÓN */}

        <form
          className="jb-panel jb-form-panel"
          onSubmit={(event) => {
            event.preventDefault()

            if (juntaEditando) {
              void actualizarJunta()
            } else {
              void crearJunta(event)
            }
          }}
        >
          <div className="jb-form-header">

            <div className="jb-header-row">
              <div>
                <div className="jb-title-row">
                  <h2 className="jb-form-title">
                    {juntaEditando
                      ? 'Editar Junta de Vecinos'
                      : 'Nueva Junta de Vecinos'}
                  </h2>

                  <span
                    className={
                      juntaEditando
                        ? 'jb-badge'
                        : 'jb-badge jb-badge-green'
                    }
                  >
                    {juntaEditando
                      ? `Editando #${juntaEditando.id}`
                      : 'Nuevo registro'}
                  </span>
                </div>

                <p className="jb-subtitle">
                  {juntaEditando
                    ? 'Actualiza la información de la junta seleccionada.'
                    : 'Registra una nueva Junta de Vecinos en la plataforma.'}
                </p>
              </div>

              {juntaEditando && (
                <button
                  type="button"
                  className="jb-button"
                  disabled={guardando}
                  onClick={cancelarEdicion}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>

          <div className="jb-form-body">
            <div className="jb-fields">

              {/* NOMBRE */}

              <label>
                <span className="jb-label">
                  Nombre
                  <span className="jb-required">
                    Obligatorio
                  </span>
                </span>

                <input
                  type="text"
                  className="jb-input"
                  value={nombre}
                  onChange={(event) =>
                    setNombre(event.target.value)
                  }
                  placeholder="Ej: Junta de Vecinos Villa Esperanza"
                  required
                />
              </label>

              {/* COMUNA */}

              <label>
                <span className="jb-label">
                  Comuna
                  <span className="jb-required">
                    Obligatorio
                  </span>
                </span>

                <select
                  className="jb-input"
                  value={comuna}
                  onChange={(event) =>
                    setComuna(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Seleccione una comuna
                  </option>

                  {COMUNAS_RM.map((nombreComuna) => (
                    <option
                      key={nombreComuna}
                      value={nombreComuna}
                    >
                      {nombreComuna}
                    </option>
                  ))}
                </select>
              </label>

              {/* DESCRIPCIÓN */}

              <label className="jb-field-full">
                <span className="jb-label">
                  Descripción
                  <span className="jb-optional">
                    Opcional
                  </span>
                </span>

                <textarea
                  className="jb-input"
                  value={descripcion}
                  onChange={(event) =>
                    setDescripcion(event.target.value)
                  }
                  placeholder="Agrega una breve descripción de la Junta de Vecinos..."
                />

                <div className="jb-counter">
                  {descripcion.length} caracteres
                </div>
              </label>
            </div>

            {/* ACCIONES */}

            <div className="jb-form-actions">
              {juntaEditando && (
                <button
                  type="button"
                  className="jb-button"
                  disabled={guardando}
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                className="jb-button jb-button-primary"
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : juntaEditando
                    ? 'Guardar Cambios'
                    : 'Crear Junta'}
              </button>
            </div>
          </div>
        </form>

        {/* CARGANDO */}

        {cargando && (
          <div className="jb-panel jb-loading">
            <span className="loading loading-spinner loading-lg" />
            <p className="mt-4">
              Cargando juntas de vecinos...
            </p>
          </div>
        )}

        {/* LISTADO */}

        {!cargando && (
          <>
            <div className="jb-list-header">
              <div>
                <h2 className="jb-section-heading">
                  Juntas registradas
                </h2>

                <p className="jb-subtitle">
                  Revisa y edita la información de las juntas
                  existentes.
                </p>
              </div>

              {juntas.length > 0 && (
                <span className="jb-badge">
                  {juntas.length}{' '}
                  {juntas.length === 1
                    ? 'junta'
                    : 'juntas'}
                </span>
              )}
            </div>

            {juntas.length === 0 ? (
              <div className="jb-panel jb-empty">
                <div className="jb-empty-icon">
                  J
                </div>

                <h3>
                  No existen juntas registradas
                </h3>

                <p>
                  Crea la primera Junta de Vecinos
                  utilizando el formulario superior.
                </p>
              </div>
            ) : (
              <div className="jb-panel jb-table-scroll">
                <table className="jb-table">
                  <thead>
                    <tr>
                      <th>Junta</th>
                      <th>Comuna</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Creación</th>
                      <th style={{ textAlign: 'right' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {juntas.map((junta) => (
                      <tr key={junta.id}>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              minWidth: 200,
                            }}
                          >
                            <div className="jb-avatar">
                              {junta.nombre
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                }}
                              >
                                {junta.nombre}
                              </div>

                              <div
                                className="jb-muted"
                                style={{
                                  fontSize: 12,
                                  marginTop: 4,
                                }}
                              >
                                Junta #{junta.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="jb-badge">
                            {junta.comuna}
                          </span>
                        </td>

                        <td>
                          <span className="jb-muted">
                            {junta.descripcion ||
                              'Sin descripción'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              junta.activa
                                ? 'jb-badge jb-badge-green'
                                : 'jb-badge jb-badge-muted'
                            }
                          >
                            {junta.activa
                              ? 'Activa'
                              : 'Inactiva'}
                          </span>
                        </td>

                        <td>
                          <span className="jb-muted">
                            {formatearFecha(
                              junta.fecha_creacion
                            )}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={
                              juntaEditando?.id === junta.id
                                ? 'jb-button jb-button-primary'
                                : 'jb-button'
                            }
                            disabled={guardando}
                            onClick={() =>
                              comenzarEdicion(junta)
                            }
                          >
                            {juntaEditando?.id === junta.id
                              ? 'Editando'
                              : 'Editar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      </section>
    </main>
  )
}

export default JuntasVecinosPage
