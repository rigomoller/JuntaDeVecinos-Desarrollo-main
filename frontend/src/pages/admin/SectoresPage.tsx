
import { useEffect, useState } from 'react'
import type { FormEventHandler } from 'react'
import { Link } from 'react-router-dom'

type JuntaVecinos = {
  id: number
  nombre: string
  comuna: string
  activa: boolean
}

type Sector = {
  id: number
  junta_vecinos: number
  junta_nombre: string
  nombre: string
  descripcion: string | null
  activo: boolean
  fecha_creacion: string
}

function SectoresPage() {
  const [sectores, setSectores] = useState<Sector[]>([])
  const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [juntaSeleccionada, setJuntaSeleccionada] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [activo, setActivo] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [sectorEditando, setSectorEditando] =
    useState<Sector | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true)
      setError('')

      try {
        const [sectoresResponse, juntasResponse] =
          await Promise.all([
            fetch(
              'http://localhost:8000/api/organizacion/sectores/',
              { credentials: 'include' }
            ),
            fetch(
              'http://localhost:8000/api/organizacion/juntas/',
              { credentials: 'include' }
            ),
          ])

        if (!sectoresResponse.ok || !juntasResponse.ok) {
          setError(
            'No fue posible cargar la información territorial.'
          )
          return
        }

        const sectoresData =
          (await sectoresResponse.json()) as Sector[]

        const juntasData =
          (await juntasResponse.json()) as JuntaVecinos[]

        setSectores(sectoresData)
        setJuntas(juntasData)
      } catch {
        setError('No fue posible comunicarse con el servidor.')
      } finally {
        setCargando(false)
      }
    }

    void cargarDatos()
  }, [])

  const crearSector: FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault()
      setError('')
      setMensaje('')

      if (!juntaSeleccionada) {
        setError('Debe seleccionar una junta de vecinos.')
        return
      }

      setGuardando(true)

      try {
        const response = await fetch(
          'http://localhost:8000/api/organizacion/sectores/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              junta_vecinos: Number(juntaSeleccionada),
              nombre,
              descripcion,
              activo,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setError(
            data.detail ??
            data.nombre?.[0] ??
            data.junta_vecinos?.[0] ??
            'No fue posible crear el sector.'
          )
          return
        }

        setSectores((actuales) => [
          ...actuales,
          data as Sector,
        ])

        setJuntaSeleccionada('')
        setNombre('')
        setDescripcion('')
        setActivo(true)
        setMensaje('Sector creado correctamente.')
      } catch {
        setError('No fue posible comunicarse con el servidor.')
      } finally {
        setGuardando(false)
      }
    }

  const comenzarEdicion = (sector: Sector) => {
    setSectorEditando(sector)
    setJuntaSeleccionada(String(sector.junta_vecinos))
    setNombre(sector.nombre)
    setDescripcion(sector.descripcion ?? '')
    setActivo(sector.activo)
    setError('')
    setMensaje('')
  }

  const cancelarEdicion = () => {
    setSectorEditando(null)
    setJuntaSeleccionada('')
    setNombre('')
    setDescripcion('')
    setActivo(true)
    setError('')
    setMensaje('')
  }

  const actualizarSector = async () => {
    if (!sectorEditando) return

    setError('')
    setMensaje('')
    setGuardando(true)

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/sectores/${sectorEditando.id}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            junta_vecinos: Number(juntaSeleccionada),
            nombre,
            descripcion,
            activo,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ??
          data.nombre?.[0] ??
          data.junta_vecinos?.[0] ??
          'No fue posible actualizar el sector.'
        )
        return
      }

      setSectores((actuales) =>
        actuales.map((sector) =>
          sector.id === data.id
            ? (data as Sector)
            : sector
        )
      )

      setSectorEditando(null)
      setJuntaSeleccionada('')
      setNombre('')
      setDescripcion('')
      setActivo(true)
      setMensaje('Sector actualizado correctamente.')
    } catch {
      setError('No fue posible comunicarse con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  const sectoresActivos =
    sectores.filter((sector) => sector.activo).length

  const sectoresInactivos =
    sectores.length - sectoresActivos

  const juntasActivas =
    juntas.filter((junta) => junta.activa).length

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      dateStyle: 'medium',
    })
  }

  return (
    <main className="sectores-bosque">
      <style>{`
        .sectores-bosque {
          --sb-oro: #d7ac32;
          --sb-oro-claro: #f0d375;
          --sb-crema: #f6efd9;
          --sb-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 16px;
          color: var(--sb-crema);
          font-family: 'Segoe UI', Arial, sans-serif;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/sector.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .sectores-bosque,
        .sectores-bosque * {
          box-sizing: border-box;
        }

        .sectores-bosque .sb-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* PANELES TRANSPARENTES */

        .sectores-bosque .sb-panel {
          background: rgba(8, 29, 19, 0.77);
          border: 1px solid rgba(215, 172, 50, 0.30);
          border-radius: 23px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.16);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* TITULOS */

        .sectores-bosque h1,
        .sectores-bosque h2,
        .sectores-bosque h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--sb-crema);
          line-height: 1.2;
        }

        .sectores-bosque .sb-header {
          padding: 30px;
          margin-bottom: 26px;
        }

        .sectores-bosque .sb-header-row {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .sectores-bosque .sb-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .sectores-bosque .sb-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 42px);
          font-weight: 700;
        }

        .sectores-bosque .sb-subtitle {
          margin: 0;
          color: var(--sb-suave);
          font-size: 16px;
          line-height: 1.7;
        }

        /* ETIQUETAS */

        .sectores-bosque .sb-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 15px;

          border-radius: 999px;
          border: 1px solid rgba(215, 172, 50, 0.48);
          background: rgba(215, 172, 50, 0.13);

          color: #e9c454;
          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
        }

        .sectores-bosque .sb-badge-green {
          color: #a6eac4;
          border-color: rgba(80, 183, 125, 0.5);
          background: rgba(28, 125, 78, 0.20);
        }

        .sectores-bosque .sb-badge-muted {
          color: #e6e9df;
          border-color: rgba(220, 220, 200, 0.25);
          background: rgba(230, 230, 210, 0.08);
        }

        /* BOTONES */

        .sectores-bosque .sb-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-height: 45px;
          padding: 12px 22px;

          border: 1px solid rgba(215, 172, 50, 0.65);
          border-radius: 15px;
          background: rgba(7, 26, 17, 0.60);

          color: var(--sb-crema);
          font: inherit;
          font-weight: 650;
          text-decoration: none;
          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .sectores-bosque .sb-button:hover {
          background: rgba(215, 172, 50, 0.20);
          border-color: #e9c454;
        }

        .sectores-bosque .sb-button-primary {
          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );
          border-color: #d7ac32;
          color: #102419;
          font-weight: 750;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .sectores-bosque .sb-button-primary:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
          transform: translateY(-1px);
        }

        .sectores-bosque .sb-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* TARJETAS ESTADISTICAS */

        .sectores-bosque .sb-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .sectores-bosque .sb-stat {
          padding: 23px 25px;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .sectores-bosque .sb-stat:hover {
          transform: translateY(-3px);
          background: rgba(12, 43, 26, 0.85);
        }

        .sectores-bosque .sb-stat-label {
          margin: 0 0 15px;
          color: #d1d6c7;
          font-size: 15px;
          font-weight: 600;
        }

        .sectores-bosque .sb-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .sectores-bosque .sb-stat-number {
          color: var(--sb-oro);
          font-size: 35px;
          line-height: 1;
          font-weight: 800;
        }

        /* MENSAJES */

        .sectores-bosque .sb-alert {
          padding: 15px 19px;
          margin-bottom: 24px;
          border-radius: 13px;
          font-size: 15px;
        }

        .sectores-bosque .sb-alert-error {
          background: rgba(118, 33, 35, 0.84);
          border: 1px solid rgba(231, 104, 104, 0.5);
          color: #ffe4e4;
        }

        .sectores-bosque .sb-alert-success {
          background: rgba(18, 93, 57, 0.8);
          border: 1px solid rgba(102, 201, 140, 0.45);
          color: #dbffe6;
        }

        /* FORMULARIO */

        .sectores-bosque .sb-form-panel {
          margin-bottom: 32px;
          overflow: hidden;
        }

        .sectores-bosque .sb-form-header {
          padding: 26px 30px;
          border-bottom: 1px solid rgba(215, 172, 50, 0.2);
        }

        .sectores-bosque .sb-form-title {
          margin: 0;
          font-size: clamp(25px, 2.5vw, 33px);
        }

        .sectores-bosque .sb-form-body {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
          padding: 30px;
        }

        .sectores-bosque .sb-field-full {
          grid-column: 1 / -1;
        }

        .sectores-bosque .sb-label {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-bottom: 10px;

          color: #f0eddf;
          font-size: 15px;
          font-weight: 650;
        }

        .sectores-bosque .sb-required {
          color: #f0b3a3;
          font-weight: 400;
        }

        .sectores-bosque .sb-optional {
          color: #b6c0b3;
          font-weight: 400;
        }

        /* INPUTS */

        .sectores-bosque .sb-input {
          display: block;
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

        .sectores-bosque .sb-input::placeholder {
          color: #aab8aa;
          opacity: 1;
        }

        .sectores-bosque .sb-input:focus {
          border-color: #e8c657;
          box-shadow: 0 0 0 3px rgba(215, 172, 50, 0.15);
        }

        .sectores-bosque select.sb-input {
          cursor: pointer;
          color-scheme: dark;
        }

        .sectores-bosque .sb-input option {
          background: #102b1d;
          color: #f7f1df;
        }

        .sectores-bosque textarea.sb-input {
          min-height: 145px;
          resize: vertical;
        }

        .sectores-bosque .sb-counter {
          margin-top: 8px;
          color: #acb8a9;
          font-size: 12px;
          text-align: right;
        }

        /* CASILLA SECTOR ACTIVO */

        .sectores-bosque .sb-check-card {
          padding: 20px;
          border: 1px solid rgba(215, 172, 50, 0.28);
          border-radius: 16px;
          background: rgba(215, 172, 50, 0.07);
        }

        .sectores-bosque .sb-check-label {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          cursor: pointer;
        }

        .sectores-bosque .sb-checkbox {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          margin-top: 2px;
          accent-color: #d7ac32;
          cursor: pointer;
        }

        .sectores-bosque .sb-check-title {
          margin: 0;
          color: #f6efd9;
          font-size: 16px;
          font-weight: 700;
        }

        .sectores-bosque .sb-check-description {
          margin: 6px 0 0;
          color: #c4cfbf;
          font-size: 14px;
          line-height: 1.6;
        }

        /* ACCIONES FORMULARIO */

        .sectores-bosque .sb-form-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid rgba(215, 172, 50, 0.20);
        }

        /* LISTADO */

        .sectores-bosque .sb-list-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 18px;
        }

        .sectores-bosque .sb-section-heading {
          margin: 0 0 12px;
          font-size: 30px;
        }

        .sectores-bosque .sb-empty {
          padding: 55px 25px;
          text-align: center;
        }

        .sectores-bosque .sb-empty-icon {
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

        .sectores-bosque .sb-empty h3 {
          margin: 0 0 12px;
          font-size: 23px;
        }

        .sectores-bosque .sb-empty p {
          max-width: 470px;
          margin: 0 auto;
          color: #cbd2c4;
          line-height: 1.7;
        }

        /* TABLA */

        .sectores-bosque .sb-table-scroll {
          overflow-x: auto;
          border-radius: 23px;
        }

        .sectores-bosque .sb-table {
          width: 100%;
          border-collapse: collapse;
          color: #f1eddf;
          font-size: 14px;
        }

        .sectores-bosque .sb-table thead {
          background: rgba(215, 172, 50, 0.13);
        }

        .sectores-bosque .sb-table th {
          padding: 18px;
          color: #ebce70;
          text-align: left;
          font-weight: 700;
          white-space: nowrap;
        }

        .sectores-bosque .sb-table td {
          padding: 18px;
          border-top: 1px solid rgba(215, 172, 50, 0.15);
          vertical-align: middle;
        }

        .sectores-bosque .sb-table tbody tr:hover {
          background: rgba(215, 172, 50, 0.07);
        }

        .sectores-bosque .sb-avatar {
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

        .sectores-bosque .sb-muted {
          color: #bfcbbe;
        }

        .sectores-bosque .sb-loading {
          padding: 45px;
          text-align: center;
          color: #ebce70;
        }

        /* ACCESIBILIDAD */

        .sectores-bosque button:focus-visible,
        .sectores-bosque a:focus-visible,
        .sectores-bosque .sb-input:focus-visible,
        .sectores-bosque .sb-checkbox:focus-visible {
          outline: 2px solid #e8c657;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .sectores-bosque .sb-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .sectores-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .sectores-bosque .sb-header,
          .sectores-bosque .sb-form-header,
          .sectores-bosque .sb-form-body {
            padding: 22px;
          }

          .sectores-bosque .sb-form-body {
            grid-template-columns: 1fr;
          }

          .sectores-bosque .sb-stats {
            gap: 12px;
          }

          .sectores-bosque .sb-stat {
            padding: 18px;
          }

          .sectores-bosque .sb-stat-number {
            font-size: 30px;
          }
        }

        @media (max-width: 420px) {
          .sectores-bosque .sb-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="sb-container">

        {/* ENCABEZADO */}

        <div className="sb-panel sb-header">
          <div className="sb-header-row">
            <div>
              <div className="sb-title-row">
                <h1 className="sb-title">
                  Sectores
                </h1>

                <span className="sb-badge">
                  Administración
                </span>
              </div>

              <p className="sb-subtitle">
                Administra los sectores territoriales asociados
                a cada Junta de Vecinos.
              </p>
            </div>

            <Link to="/admin" className="sb-button">
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* MENSAJES */}

        {error && (
          <div
            className="sb-alert sb-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            className="sb-alert sb-alert-success"
            role="status"
          >
            {mensaje}
          </div>
        )}

        {/* ESTADÍSTICAS */}

        {!cargando && (
          <div className="sb-stats">

            <div className="sb-panel sb-stat">
              <p className="sb-stat-label">
                Total sectores
              </p>

              <div className="sb-stat-bottom">
                <span className="sb-stat-number">
                  {sectores.length}
                </span>

                <span className="sb-badge">
                  Registrados
                </span>
              </div>
            </div>

            <div className="sb-panel sb-stat">
              <p className="sb-stat-label">
                Activos
              </p>

              <div className="sb-stat-bottom">
                <span className="sb-stat-number">
                  {sectoresActivos}
                </span>

                <span className="sb-badge sb-badge-green">
                  Activos
                </span>
              </div>
            </div>

            <div className="sb-panel sb-stat">
              <p className="sb-stat-label">
                Inactivos
              </p>

              <div className="sb-stat-bottom">
                <span className="sb-stat-number">
                  {sectoresInactivos}
                </span>

                <span className="sb-badge sb-badge-muted">
                  Inactivos
                </span>
              </div>
            </div>

            <div className="sb-panel sb-stat">
              <p className="sb-stat-label">
                Juntas disponibles
              </p>

              <div className="sb-stat-bottom">
                <span className="sb-stat-number">
                  {juntasActivas}
                </span>

                <span className="sb-badge">
                  Activas
                </span>
              </div>
            </div>

          </div>
        )}

        {/* PANEL DE FORMULARIO */}

        <div className="sb-panel sb-form-panel">

          <div className="sb-form-header">
            <div className="sb-header-row">
              <div>
                <div className="sb-title-row">
                  <h2 className="sb-form-title">
                    {sectorEditando
                      ? 'Editar sector'
                      : 'Nuevo sector'}
                  </h2>

                  <span
                    className={
                      sectorEditando
                        ? 'sb-badge'
                        : 'sb-badge sb-badge-green'
                    }
                  >
                    {sectorEditando
                      ? `Editando #${sectorEditando.id}`
                      : 'Nuevo registro'}
                  </span>
                </div>

                <p className="sb-subtitle">
                  {sectorEditando
                    ? 'Actualiza los datos del sector seleccionado.'
                    : 'Registra un nuevo sector asociado a una Junta de Vecinos.'}
                </p>
              </div>

              {sectorEditando && (
                <button
                  type="button"
                  className="sb-button"
                  disabled={guardando}
                  onClick={cancelarEdicion}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>

          {/* FORMULARIO */}

          <form
            className="sb-form-body"
            onSubmit={(event) => {
              if (sectorEditando) {
                event.preventDefault()
                void actualizarSector()
              } else {
                void crearSector(event)
              }
            }}
          >

            {/* JUNTA DE VECINOS */}

            <label>
              <span className="sb-label">
                Junta de Vecinos
                <span className="sb-required">
                  Obligatorio
                </span>
              </span>

              <select
                id="junta-vecinos"
                className="sb-input"
                value={juntaSeleccionada}
                onChange={(event) =>
                  setJuntaSeleccionada(event.target.value)
                }
                required
              >
                <option value="">
                  Seleccione una junta
                </option>

                {juntas.map((junta) => (
                  <option
                    key={junta.id}
                    value={junta.id}
                  >
                    {junta.nombre}
                  </option>
                ))}
              </select>
            </label>

            {/* NOMBRE SECTOR */}

            <label>
              <span className="sb-label">
                Nombre del sector
                <span className="sb-required">
                  Obligatorio
                </span>
              </span>

              <input
                id="nombre-sector"
                type="text"
                className="sb-input"
                value={nombre}
                onChange={(event) =>
                  setNombre(event.target.value)
                }
                placeholder="Ej: Sector Norte"
                required
              />
            </label>

            {/* DESCRIPCIÓN */}

            <label className="sb-field-full">
              <span className="sb-label">
                Descripción
                <span className="sb-optional">
                  Opcional
                </span>
              </span>

              <textarea
                id="descripcion-sector"
                className="sb-input"
                value={descripcion}
                onChange={(event) =>
                  setDescripcion(event.target.value)
                }
                placeholder="Describe brevemente el sector..."
              />

              <div className="sb-counter">
                {descripcion.length} caracteres
              </div>
            </label>

            {/* SECTOR ACTIVO */}

            <div className="sb-field-full">
              <div className="sb-check-card">
                <label className="sb-check-label">
                  <input
                    type="checkbox"
                    className="sb-checkbox"
                    checked={activo}
                    onChange={(event) =>
                      setActivo(event.target.checked)
                    }
                  />

                  <div>
                    <p className="sb-check-title">
                      Sector activo
                    </p>

                    <p className="sb-check-description">
                      Los sectores activos pueden ser
                      utilizados en las asociaciones
                      territoriales de los vecinos.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* BOTONES */}

            <div className="sb-field-full sb-form-actions">
              {sectorEditando && (
                <button
                  type="button"
                  className="sb-button"
                  disabled={guardando}
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                className="sb-button sb-button-primary"
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : sectorEditando
                    ? 'Actualizar sector'
                    : 'Crear sector'}
              </button>
            </div>

          </form>
        </div>

        {/* CARGANDO */}

        {cargando && (
          <div className="sb-panel sb-loading">
            <span className="loading loading-spinner loading-lg" />

            <p className="mt-4">
              Cargando sectores...
            </p>
          </div>
        )}

        {/* LISTADO DE SECTORES */}

        {!cargando && (
          <>
            <div className="sb-list-header">
              <div>
                <h2 className="sb-section-heading">
                  Sectores registrados
                </h2>

                <p className="sb-subtitle">
                  Revisa y edita los sectores asociados
                  a las juntas.
                </p>
              </div>

              {sectores.length > 0 && (
                <span className="sb-badge">
                  {sectores.length}{' '}
                  {sectores.length === 1
                    ? 'sector'
                    : 'sectores'}
                </span>
              )}
            </div>

            {sectores.length === 0 ? (

              <div className="sb-panel sb-empty">
                <div className="sb-empty-icon">
                  S
                </div>

                <h3>
                  No existen sectores registrados
                </h3>

                <p>
                  Crea el primer sector utilizando
                  el formulario superior.
                </p>
              </div>

            ) : (

              <div className="sb-panel sb-table-scroll">
                <table className="sb-table">

                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Junta de Vecinos</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Creación</th>
                      <th style={{ textAlign: 'right' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sectores.map((sector) => (
                      <tr key={sector.id}>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              minWidth: 180,
                            }}
                          >
                            <div className="sb-avatar">
                              {sector.nombre
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div style={{ fontWeight: 700 }}>
                                {sector.nombre}
                              </div>

                              <div
                                className="sb-muted"
                                style={{
                                  fontSize: 12,
                                  marginTop: 4,
                                }}
                              >
                                Sector #{sector.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600 }}>
                            {sector.junta_nombre}
                          </span>
                        </td>

                        <td>
                          <span className="sb-muted">
                            {sector.descripcion ||
                              'Sin descripción'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              sector.activo
                                ? 'sb-badge sb-badge-green'
                                : 'sb-badge sb-badge-muted'
                            }
                          >
                            {sector.activo
                              ? 'Activo'
                              : 'Inactivo'}
                          </span>
                        </td>

                        <td>
                          <span className="sb-muted">
                            {formatearFecha(
                              sector.fecha_creacion
                            )}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={
                              sectorEditando?.id === sector.id
                                ? 'sb-button sb-button-primary'
                                : 'sb-button'
                            }
                            disabled={guardando}
                            onClick={() =>
                              comenzarEdicion(sector)
                            }
                          >
                            {sectorEditando?.id === sector.id
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

export default SectoresPage
