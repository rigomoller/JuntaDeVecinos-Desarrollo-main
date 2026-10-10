
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

type Directiva = {
  id: number
  junta_vecinos: number
  junta_nombre: string
  fecha_inicio: string
  fecha_fin: string | null
  estado: 'VIGENTE' | 'FINALIZADA'
  observacion: string | null
}

function DirectivasPage() {
  const [juntas, setJuntas] = useState<JuntaVecinos[]>([])
  const [directivas, setDirectivas] = useState<Directiva[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [juntaSeleccionada, setJuntaSeleccionada] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [observacion, setObservacion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [directivaAFinalizar, setDirectivaAFinalizar] =
    useState<Directiva | null>(null)
  const [finalizando, setFinalizando] = useState(false)

  // CARGAR DATOS
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [responseJuntas, responseDirectivas] =
          await Promise.all([
            fetch(
              'http://localhost:8000/api/organizacion/juntas/',
              { credentials: 'include' }
            ),
            fetch(
              'http://localhost:8000/api/organizacion/directivas/',
              { credentials: 'include' }
            ),
          ])

        if (!responseJuntas.ok) {
          throw new Error(
            'No fue posible cargar las juntas de vecinos.'
          )
        }

        if (!responseDirectivas.ok) {
          throw new Error(
            'No fue posible cargar las directivas.'
          )
        }

        const juntasData = await responseJuntas.json()
        const directivasData = await responseDirectivas.json()

        setJuntas(juntasData)
        setDirectivas(directivasData)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar la información.'
        )
      } finally {
        setCargando(false)
      }
    }

    void cargarDatos()
  }, [])

  // CREAR DIRECTIVA
  async function crearDirectiva(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      const response = await fetch(
        'http://localhost:8000/api/organizacion/directivas/',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            junta_vecinos: Number(juntaSeleccionada),
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin || null,
            estado: 'VIGENTE',
            observacion: observacion || null,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.estado?.[0] ||
          data.detail ||
          'No fue posible crear la directiva.'
        )
      }

      setDirectivas((actuales) => [
        data as Directiva,
        ...actuales,
      ])

      setJuntaSeleccionada('')
      setFechaInicio('')
      setFechaFin('')
      setObservacion('')
      setMensaje('Directiva creada correctamente.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al crear la directiva.'
      )
    } finally {
      setGuardando(false)
    }
  }

  // FINALIZAR DIRECTIVA
  async function finalizarDirectiva(directiva: Directiva) {
    setFinalizando(true)
    setError('')
    setMensaje('')

    try {
      const response = await fetch(
        `http://localhost:8000/api/organizacion/directivas/${directiva.id}/`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'FINALIZADA',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          'No fue posible finalizar la directiva.'
        )
      }

      setDirectivas((actuales) =>
        actuales.map((item) =>
          item.id === directiva.id
            ? (data as Directiva)
            : item
        )
      )

      setMensaje('Directiva finalizada correctamente.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al finalizar la directiva.'
      )
    } finally {
      setFinalizando(false)
      setDirectivaAFinalizar(null)
    }
  }

  // ESTADÍSTICAS
  const directivasVigentes = directivas.filter(
    (directiva) => directiva.estado === 'VIGENTE'
  ).length

  const directivasFinalizadas = directivas.filter(
    (directiva) => directiva.estado === 'FINALIZADA'
  ).length

  const juntasActivas = juntas.filter(
    (junta) => junta.activa
  ).length

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Sin fecha'

    return new Date(
      `${fecha}T00:00:00`
    ).toLocaleDateString('es-CL', {
      dateStyle: 'medium',
    })
  }

  return (
    <main className="directivas-bosque">
      <style>{`
        /* =====================================
           DISEÑO GENERAL VERDE BOSQUE
           ===================================== */

        .directivas-bosque {
          --db-oro: #d7ac32;
          --db-oro-claro: #f0d375;
          --db-crema: #f6efd9;
          --db-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 16px;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/directivas.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;

          color: var(--db-crema);
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .directivas-bosque,
        .directivas-bosque * {
          box-sizing: border-box;
        }

        .directivas-bosque .db-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        /* PANELES TRANSPARENTES */

        .directivas-bosque .db-panel {
          background: rgba(8, 29, 19, 0.77);
          border: 1px solid rgba(215, 172, 50, 0.30);
          border-radius: 23px;

          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.16);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* TÍTULOS */

        .directivas-bosque h1,
        .directivas-bosque h2,
        .directivas-bosque h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--db-crema);
          line-height: 1.2;
        }

        .directivas-bosque .db-header {
          padding: 30px;
          margin-bottom: 26px;
        }

        .directivas-bosque .db-header-row {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .directivas-bosque .db-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .directivas-bosque .db-title {
          margin: 0;
          font-size: clamp(30px, 3vw, 42px);
          font-weight: 700;
        }

        .directivas-bosque .db-subtitle {
          margin: 0;
          max-width: 800px;
          color: var(--db-suave);
          font-size: 16px;
          line-height: 1.7;
        }

        /* ETIQUETAS */

        .directivas-bosque .db-badge {
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

        .directivas-bosque .db-badge-green {
          background: rgba(28, 125, 78, 0.20);
          border-color: rgba(80, 183, 125, 0.5);
          color: #a6eac4;
        }

        .directivas-bosque .db-badge-muted {
          background: rgba(230, 230, 210, 0.08);
          border-color: rgba(220, 220, 200, 0.25);
          color: #e6e9df;
        }

        /* BOTONES */

        .directivas-bosque .db-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          min-height: 45px;
          padding: 12px 22px;

          background: rgba(7, 26, 17, 0.60);
          border: 1px solid rgba(215, 172, 50, 0.65);
          border-radius: 15px;

          color: var(--db-crema);
          font: inherit;
          font-weight: 650;
          text-decoration: none;
          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .directivas-bosque .db-button:hover {
          background: rgba(215, 172, 50, 0.20);
          border-color: #e9c454;
          color: #fff7de;
        }

        .directivas-bosque .db-button-primary {
          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );
          border-color: #d7ac32;
          color: #102419;
          font-weight: 750;

          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .directivas-bosque .db-button-primary:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
          transform: translateY(-1px);
        }

        .directivas-bosque .db-button-danger {
          background: rgba(128, 37, 40, 0.24);
          border-color: rgba(225, 110, 110, 0.70);
          color: #ffc2bf;
        }

        .directivas-bosque .db-button-danger:hover {
          background: rgba(165, 50, 52, 0.55);
          border-color: #ef9c98;
          color: #fff0ee;
        }

        .directivas-bosque .db-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /* ESTADÍSTICAS */

        .directivas-bosque .db-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .directivas-bosque .db-stat {
          padding: 23px 25px;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .directivas-bosque .db-stat:hover {
          transform: translateY(-3px);
          background: rgba(12, 43, 26, 0.85);
        }

        .directivas-bosque .db-stat-label {
          margin: 0 0 15px;
          color: #d1d6c7;
          font-size: 15px;
          font-weight: 600;
        }

        .directivas-bosque .db-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .directivas-bosque .db-stat-number {
          color: var(--db-oro);
          font-size: 35px;
          line-height: 1;
          font-weight: 800;
        }

        /* ALERTAS */

        .directivas-bosque .db-alert {
          padding: 15px 19px;
          margin-bottom: 24px;
          border-radius: 13px;
          font-size: 15px;
        }

        .directivas-bosque .db-alert-error {
          background: rgba(118, 33, 35, 0.84);
          border: 1px solid rgba(231, 104, 104, 0.5);
          color: #ffe4e4;
        }

        .directivas-bosque .db-alert-success {
          background: rgba(18, 93, 57, 0.80);
          border: 1px solid rgba(102, 201, 140, 0.45);
          color: #dbffe6;
        }

        /* FORMULARIO */

        .directivas-bosque .db-form-panel {
          margin-bottom: 32px;
          overflow: hidden;
        }

        .directivas-bosque .db-form-header {
          padding: 26px 30px;
          border-bottom: 1px solid rgba(215, 172, 50, 0.20);
        }

        .directivas-bosque .db-form-title {
          margin: 0;
          font-size: clamp(25px, 2.5vw, 33px);
        }

        .directivas-bosque .db-form-body {
          padding: 30px;
        }

        .directivas-bosque .db-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .directivas-bosque .db-field-full {
          grid-column: 1 / -1;
        }

        .directivas-bosque .db-label {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-bottom: 10px;

          color: #f0eddf;
          font-size: 15px;
          font-weight: 650;
        }

        .directivas-bosque .db-required {
          color: #f0b3a3;
          font-weight: 400;
        }

        .directivas-bosque .db-optional {
          color: #b6c0b3;
          font-weight: 400;
        }

        /* CAMPOS Y FECHAS */

        .directivas-bosque .db-input {
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
          color-scheme: dark;
        }

        .directivas-bosque .db-input::placeholder {
          color: #aab8aa;
          opacity: 1;
        }

        .directivas-bosque .db-input:focus {
          border-color: #e8c657;
          box-shadow:
            0 0 0 3px rgba(215, 172, 50, 0.15);
        }

        .directivas-bosque select.db-input {
          cursor: pointer;
        }

        .directivas-bosque .db-input option {
          background: #102b1d;
          color: #f7f1df;
        }

        .directivas-bosque textarea.db-input {
          min-height: 145px;
          resize: vertical;
        }

        .directivas-bosque .db-counter {
          margin-top: 8px;
          color: #acb8a9;
          font-size: 12px;
          text-align: right;
        }

        /* ESTADO INICIAL */

        .directivas-bosque .db-state-card {
          min-height: 100px;
          padding: 20px;
          border: 1px solid rgba(215, 172, 50, 0.28);
          border-radius: 16px;
          background: rgba(215, 172, 50, 0.07);
        }

        .directivas-bosque .db-state-label {
          margin: 0 0 12px;
          color: #c3cbbd;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .directivas-bosque .db-state-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          color: #cbd2c4;
          font-size: 14px;
        }

        .directivas-bosque .db-form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(215, 172, 50, 0.20);
        }

        /* LISTADO */

        .directivas-bosque .db-list-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 18px;
        }

        .directivas-bosque .db-section-heading {
          margin: 0 0 12px;
          font-size: 30px;
        }

        .directivas-bosque .db-empty {
          padding: 55px 25px;
          text-align: center;
        }

        .directivas-bosque .db-empty-icon {
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

        .directivas-bosque .db-empty h3 {
          margin: 0 0 12px;
          font-size: 23px;
        }

        .directivas-bosque .db-empty p {
          max-width: 470px;
          margin: 0 auto;
          color: #cbd2c4;
          line-height: 1.7;
        }

        /* TABLA */

        .directivas-bosque .db-table-scroll {
          overflow-x: auto;
          border-radius: 23px;
        }

        .directivas-bosque .db-table {
          width: 100%;
          border-collapse: collapse;
          color: #f1eddf;
          font-size: 14px;
        }

        .directivas-bosque .db-table thead {
          background: rgba(215, 172, 50, 0.13);
        }

        .directivas-bosque .db-table th {
          padding: 18px;
          color: #ebce70;
          text-align: left;
          font-weight: 700;
          white-space: nowrap;
        }

        .directivas-bosque .db-table td {
          padding: 18px;
          border-top: 1px solid rgba(215, 172, 50, 0.15);
          vertical-align: middle;
        }

        .directivas-bosque .db-table tbody tr:hover {
          background: rgba(215, 172, 50, 0.07);
        }

        .directivas-bosque .db-muted {
          color: #bfcbbe;
        }

        .directivas-bosque .db-loading {
          padding: 45px;
          text-align: center;
          color: #ebce70;
        }

        .directivas-bosque .db-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
          min-width: 260px;
        }

        .directivas-bosque .db-actions .db-button {
          min-height: 39px;
          padding: 9px 14px;
          font-size: 13px;
        }

        /* VENTANA DE CONFIRMACIÓN */

        .db-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 20px;
          background: rgba(0, 12, 7, 0.78);
          backdrop-filter: blur(5px);
        }

        .db-modal-box {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;

          padding: 28px;
          border: 1px solid rgba(215, 172, 50, 0.50);
          border-radius: 23px;

          background: #102a1e;
          color: #f6efd9;

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.50);
        }

        .db-modal-heading {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .db-modal-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          flex-shrink: 0;

          border-radius: 13px;
          background: rgba(170, 53, 53, 0.22);
          color: #ffb2ad;
          font-size: 23px;
          font-weight: 800;
        }

        .db-modal-box h3 {
          margin: 0 0 8px;
          font-family: Georgia, serif;
          color: #f6efd9;
          font-size: 25px;
        }

        .db-modal-text {
          color: #cbd2c4;
          font-size: 14px;
          line-height: 1.7;
        }

        .db-modal-summary {
          padding: 17px;
          border: 1px solid rgba(215, 172, 50, 0.25);
          border-radius: 14px;
          background: rgba(215, 172, 50, 0.07);
          line-height: 1.7;
        }

        .db-modal-warning {
          margin-top: 16px;
          padding: 16px;
          border: 1px solid rgba(215, 172, 50, 0.45);
          border-radius: 14px;
          background: rgba(164, 111, 24, 0.18);
          color: #f2deab;
          font-size: 14px;
          line-height: 1.6;
        }

        .db-modal-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 26px;
        }

        /* ACCESIBILIDAD */

        .directivas-bosque button:focus-visible,
        .directivas-bosque a:focus-visible,
        .directivas-bosque .db-input:focus-visible {
          outline: 2px solid #e8c657;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .directivas-bosque .db-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .directivas-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .directivas-bosque .db-header,
          .directivas-bosque .db-form-header,
          .directivas-bosque .db-form-body {
            padding: 22px;
          }

          .directivas-bosque .db-fields {
            grid-template-columns: 1fr;
          }

          .directivas-bosque .db-stats {
            gap: 12px;
          }

          .directivas-bosque .db-stat {
            padding: 18px;
          }

          .directivas-bosque .db-stat-number {
            font-size: 30px;
          }

          .db-modal-box {
            padding: 22px;
          }
        }

        @media (max-width: 420px) {
          .directivas-bosque .db-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="db-container">

        {/* ENCABEZADO */}

        <div className="db-panel db-header">
          <div className="db-header-row">
            <div>
              <div className="db-title-row">
                <h1 className="db-title">
                  Gestión de Directivas
                </h1>

                <span className="db-badge">
                  Administración
                </span>
              </div>

              <p className="db-subtitle">
                Administra las directivas asociadas a las
                Juntas de Vecinos, sus períodos de vigencia
                y sus integrantes.
              </p>
            </div>

            <Link to="/admin" className="db-button">
              ← Volver al Panel
            </Link>
          </div>
        </div>

        {/* MENSAJES */}

        {mensaje && (
          <div
            className="db-alert db-alert-success"
            role="status"
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            className="db-alert db-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ESTADÍSTICAS */}

        {!cargando && (
          <div className="db-stats">

            <div className="db-panel db-stat">
              <p className="db-stat-label">
                Total directivas
              </p>

              <div className="db-stat-bottom">
                <span className="db-stat-number">
                  {directivas.length}
                </span>
                <span className="db-badge">
                  Registradas
                </span>
              </div>
            </div>

            <div className="db-panel db-stat">
              <p className="db-stat-label">
                Vigentes
              </p>

              <div className="db-stat-bottom">
                <span className="db-stat-number">
                  {directivasVigentes}
                </span>
                <span className="db-badge db-badge-green">
                  Vigentes
                </span>
              </div>
            </div>

            <div className="db-panel db-stat">
              <p className="db-stat-label">
                Finalizadas
              </p>

              <div className="db-stat-bottom">
                <span className="db-stat-number">
                  {directivasFinalizadas}
                </span>
                <span className="db-badge db-badge-muted">
                  Históricas
                </span>
              </div>
            </div>

            <div className="db-panel db-stat">
              <p className="db-stat-label">
                Juntas activas
              </p>

              <div className="db-stat-bottom">
                <span className="db-stat-number">
                  {juntasActivas}
                </span>
                <span className="db-badge">
                  Disponibles
                </span>
              </div>
            </div>

          </div>
        )}

        {/* FORMULARIO NUEVA DIRECTIVA */}

        <form
          onSubmit={crearDirectiva}
          className="db-panel db-form-panel"
        >
          <div className="db-form-header">
            <div className="db-title-row">
              <h2 className="db-form-title">
                Nueva Directiva
              </h2>

              <span className="db-badge">
                Nuevo período
              </span>
            </div>

            <p className="db-subtitle">
              Registra una nueva directiva asociada
              a una Junta de Vecinos activa.
            </p>
          </div>

          <div className="db-form-body">
            <div className="db-fields">

              {/* JUNTA */}

              <label>
                <span className="db-label">
                  Junta de Vecinos
                  <span className="db-required">
                    Obligatorio
                  </span>
                </span>

                <select
                  className="db-input"
                  value={juntaSeleccionada}
                  onChange={(event) =>
                    setJuntaSeleccionada(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Seleccione una junta
                  </option>

                  {juntas
                    .filter((junta) => junta.activa)
                    .map((junta) => (
                      <option
                        key={junta.id}
                        value={junta.id}
                      >
                        {junta.nombre}
                      </option>
                    ))}
                </select>
              </label>

              {/* FECHA DE INICIO */}

              <label>
                <span className="db-label">
                  Fecha de inicio
                  <span className="db-required">
                    Obligatorio
                  </span>
                </span>

                <input
                  type="date"
                  className="db-input"
                  value={fechaInicio}
                  onChange={(event) =>
                    setFechaInicio(event.target.value)
                  }
                  required
                />
              </label>

              {/* FECHA DE TÉRMINO */}

              <label>
                <span className="db-label">
                  Fecha de término
                  <span className="db-optional">
                    Opcional
                  </span>
                </span>

                <input
                  type="date"
                  className="db-input"
                  value={fechaFin}
                  min={fechaInicio || undefined}
                  onChange={(event) =>
                    setFechaFin(event.target.value)
                  }
                />
              </label>

              {/* ESTADO INICIAL */}

              <div className="db-state-card">
                <p className="db-state-label">
                  Estado inicial
                </p>

                <div className="db-state-row">
                  <span className="db-badge db-badge-green">
                    Vigente
                  </span>

                  <span>
                    La nueva directiva se crea activa.
                  </span>
                </div>
              </div>

              {/* OBSERVACIÓN */}

              <label className="db-field-full">
                <span className="db-label">
                  Observación
                  <span className="db-optional">
                    Opcional
                  </span>
                </span>

                <textarea
                  className="db-input"
                  value={observacion}
                  onChange={(event) =>
                    setObservacion(event.target.value)
                  }
                  placeholder="Agrega una observación relacionada con esta directiva..."
                />

                <div className="db-counter">
                  {observacion.length} caracteres
                </div>
              </label>

            </div>

            {/* CREAR */}

            <div className="db-form-actions">
              <button
                type="submit"
                className="db-button db-button-primary"
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : 'Crear Directiva'}
              </button>
            </div>
          </div>
        </form>

        {/* CARGANDO */}

        {cargando && (
          <div className="db-panel db-loading">
            <span className="loading loading-spinner loading-lg" />

            <p style={{ marginTop: 16 }}>
              Cargando directivas...
            </p>
          </div>
        )}

        {/* DIRECTIVAS REGISTRADAS */}

        {!cargando && (
          <>
            <div className="db-list-header">
              <div>
                <h2 className="db-section-heading">
                  Directivas registradas
                </h2>

                <p className="db-subtitle">
                  Revisa su vigencia y administra sus integrantes.
                </p>
              </div>

              {directivas.length > 0 && (
                <span className="db-badge">
                  {directivas.length}{' '}
                  {directivas.length === 1
                    ? 'directiva'
                    : 'directivas'}
                </span>
              )}
            </div>

            {directivas.length === 0 ? (
              <div className="db-panel db-empty">
                <div className="db-empty-icon">
                  D
                </div>

                <h3>
                  No existen directivas registradas
                </h3>

                <p>
                  Crea la primera directiva utilizando
                  el formulario superior.
                </p>
              </div>
            ) : (
              <div className="db-panel db-table-scroll">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Junta</th>
                      <th>Fecha inicio</th>
                      <th>Fecha término</th>
                      <th>Estado</th>
                      <th>Observación</th>
                      <th style={{ textAlign: 'right' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {directivas.map((directiva) => (
                      <tr key={directiva.id}>

                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {directiva.junta_nombre}
                          </div>

                          <div
                            className="db-muted"
                            style={{
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            Directiva #{directiva.id}
                          </div>
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          {formatearFecha(directiva.fecha_inicio)}
                        </td>

                        <td style={{ whiteSpace: 'nowrap' }}>
                          {formatearFecha(directiva.fecha_fin)}
                        </td>

                        <td>
                          <span
                            className={
                              directiva.estado === 'VIGENTE'
                                ? 'db-badge db-badge-green'
                                : 'db-badge db-badge-muted'
                            }
                          >
                            {directiva.estado === 'VIGENTE'
                              ? 'Vigente'
                              : 'Finalizada'}
                          </span>
                        </td>

                        <td>
                          <span className="db-muted">
                            {directiva.observacion ||
                              'Sin observación'}
                          </span>
                        </td>

                        <td>
                          {directiva.estado === 'VIGENTE' ? (
                            <div className="db-actions">
                              <Link
                                to={`/directiva/gestion?directivaId=${directiva.id}`}
                                className="db-button db-button-primary"
                              >
                                Gestionar integrantes
                              </Link>

                              <button
                                type="button"
                                className="db-button db-button-danger"
                                onClick={() =>
                                  setDirectivaAFinalizar(directiva)
                                }
                              >
                                Finalizar
                              </button>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'right' }}>
                              <span className="db-muted">
                                Sin acciones
                              </span>
                            </div>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* MODAL FINALIZAR DIRECTIVA */}

        {directivaAFinalizar && (
          <div
            className="db-modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !finalizando
              ) {
                setDirectivaAFinalizar(null)
              }
            }}
          >
            <div
              className="db-modal-box"
              role="dialog"
              aria-modal="true"
              aria-labelledby="db-modal-title"
            >

              <div className="db-modal-heading">
                <div className="db-modal-icon">
                  !
                </div>

                <div>
                  <h3 id="db-modal-title">
                    Finalizar Directiva
                  </h3>

                  <p className="db-modal-text">
                    Esta acción cambiará el estado
                    de la directiva a finalizada.
                  </p>
                </div>
              </div>

              <div className="db-modal-summary">
                ¿Deseas finalizar la directiva vigente de{' '}
                <strong>
                  {directivaAFinalizar.junta_nombre}
                </strong>
                ?
              </div>

              <div className="db-modal-warning">
                Al finalizar la directiva, sus integrantes
                activos dejarán de tener cargos vigentes
                asociados a ella.
              </div>

              <div className="db-modal-actions">
                <button
                  type="button"
                  className="db-button"
                  disabled={finalizando}
                  onClick={() =>
                    setDirectivaAFinalizar(null)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="db-button db-button-danger"
                  disabled={finalizando}
                  onClick={() =>
                    void finalizarDirectiva(
                      directivaAFinalizar
                    )
                  }
                >
                  {finalizando
                    ? 'Finalizando...'
                    : 'Finalizar Directiva'}
                </button>
              </div>

            </div>
          </div>
        )}

      </section>
    </main>
  )
}

export default DirectivasPage
