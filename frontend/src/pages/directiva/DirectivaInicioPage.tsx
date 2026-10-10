
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import CambiarPerfilButton from '../../components/auth/CambiarPerfilButton'

type IntegranteDirectiva = {
  id: number
  usuario: number
  junta_id: number
  directiva: number
}

type DirectivaVigente = {
  directiva: {
    id: number
    junta_vecinos: number
    junta_nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    estado: string
    observacion: string | null
  }
  integrantes: {
    id: number
    usuario: number
    usuario_username: string
    usuario_nombres: string
    usuario_apellido_paterno: string
    cargo: number
    cargo_nombre: string
    junta_id: number
    junta_nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    activo: boolean
  }[]
}

const modulos = [
  {
    letra: 'D',
    titulo: 'Gestión de Directiva',
    descripcion:
      'Integrantes, cargos y organización de la directiva.',
    ruta: '/directiva/gestion',
    boton: 'Gestionar Directiva',
  },
  {
    letra: 'C',
    titulo: 'Comunicados',
    descripcion:
      'Publica información y avisos para los vecinos.',
    ruta: '/directiva/publicaciones',
    boton: 'Ver Comunicados',
  },
  {
    letra: 'E',
    titulo: 'Actividades y Eventos',
    descripcion:
      'Organiza actividades, inscripciones y asistencia.',
    ruta: '/directiva/eventos',
    boton: 'Gestionar Eventos',
  },
  {
    letra: 'S',
    titulo: 'Consultas y Solicitudes',
    descripcion:
      'Responde consultas, reclamos y solicitudes vecinales.',
    ruta: '/directiva/solicitudes',
    boton: 'Gestionar Solicitudes',
  },
  {
    letra: 'M',
    titulo: 'Mensajería',
    descripcion:
      'Revisa y responde los mensajes enviados por los vecinos.',
    ruta: '/directiva/mensajeria',
    boton: 'Ver Mensajes',
  },
  {
    letra: 'A',
    titulo: 'Asociaciones pendientes',
    descripcion:
      'Revisa y resuelve solicitudes de vecinos que desean asociarse a tu Junta de Vecinos.',
    ruta: '/directiva/asociaciones',
    boton: 'Ver Solicitudes',
  },
  {
    letra: 'S',
    titulo: 'Solicitudes de Documentos',
    descripcion:
      'Revisa, aprueba y emite documentos comunitarios.',
    ruta: '/directiva/documentos',
    boton: 'Gestionar Documentos',
  },
]

function DirectivaInicioPage() {
  const [juntaId, setJuntaId] =
    useState<number | null>(null)

  const [cargandoJunta, setCargandoJunta] =
    useState(true)

  const [cargandoDirectiva, setCargandoDirectiva] =
    useState(false)

  const [error, setError] = useState('')

  const [directivaVigente, setDirectivaVigente] =
    useState<DirectivaVigente | null>(null)

  // OBTENER JUNTA DEL USUARIO

  useEffect(() => {
    let cancelado = false

    const cargarJuntaDirectiva = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/organizacion/integrantes-directiva/',
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error(
            'No fue posible obtener la directiva actual.',
          )
        }

        const data =
          (await response.json()) as IntegranteDirectiva[]

        if (data.length === 0) {
          throw new Error(
            'No se encontró una directiva vigente asociada al usuario.',
          )
        }

        if (!cancelado) {
          setJuntaId(data[0].junta_id)
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error inesperado.',
          )
        }
      } finally {
        if (!cancelado) {
          setCargandoJunta(false)
        }
      }
    }

    void cargarJuntaDirectiva()

    return () => {
      cancelado = true
    }
  }, [])

  // OBTENER DIRECTIVA VIGENTE

  useEffect(() => {
    if (juntaId === null) return

    let cancelado = false

    const cargarDirectivaVigente = async () => {
      setCargandoDirectiva(true)

      try {
        const response = await fetch(
          `http://localhost:8000/api/organizacion/juntas/${juntaId}/directiva-vigente/`,
          {
            credentials: 'include',
          },
        )

        if (!response.ok) {
          let mensaje =
            'No fue posible obtener la directiva vigente.'

          try {
            const data = await response.json()
            mensaje = data.detail ?? mensaje
          } catch {
            // Conserva el mensaje general.
          }

          throw new Error(mensaje)
        }

        const data =
          (await response.json()) as DirectivaVigente

        if (!cancelado) {
          setDirectivaVigente(data)
          setError('')
        }
      } catch (err) {
        if (!cancelado) {
          setDirectivaVigente(null)
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error inesperado.',
          )
        }
      } finally {
        if (!cancelado) {
          setCargandoDirectiva(false)
        }
      }
    }

    void cargarDirectivaVigente()

    return () => {
      cancelado = true
    }
  }, [juntaId])

  const cargando =
    cargandoJunta ||
    cargandoDirectiva ||
    (juntaId !== null &&
      directivaVigente === null &&
      !error)

  const habilitada =
    !cargando &&
    !error &&
    directivaVigente !== null

  const formatearFecha = (fecha: string) => {
    return new Date(
      `${fecha}T00:00:00`,
    ).toLocaleDateString('es-CL')
  }

  return (
    <main className="directiva-inicio-bosque">
      <style>{`
        .directiva-inicio-bosque {
          --di-oro: #d7ac32;
          --di-oro-claro: #f0d375;
          --di-crema: #f6efd9;
          --di-suave: #cbd2c4;

          min-height: 100vh;
          padding: 32px 20px;

          color: var(--di-crema);
          font-family: 'Segoe UI', Arial, sans-serif;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4,23,16,0.35),
              rgba(4,23,16,0.48)
            ),
            url('/directivas-inicio.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .directiva-inicio-bosque,
        .directiva-inicio-bosque * {
          box-sizing: border-box;
        }

        .directiva-inicio-bosque .di-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
        }

        .directiva-inicio-bosque .di-panel {
          background: rgba(8,29,19,0.70);
          border: 1px solid rgba(215,172,50,0.32);
          border-radius: 23px;
          box-shadow: 0 12px 35px rgba(0,0,0,0.20);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .directiva-inicio-bosque h1,
        .directiva-inicio-bosque h2,
        .directiva-inicio-bosque h3 {
          margin-top: 0;
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--di-crema);
          line-height: 1.2;
        }

        .directiva-inicio-bosque .di-subtitle {
          margin: 0;
          color: var(--di-suave);
          font-size: 16px;
          line-height: 1.7;
        }

        /* ENCABEZADO */

        .directiva-inicio-bosque .di-header {
          padding: 30px;
          margin-bottom: 26px;
        }

        .directiva-inicio-bosque .di-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .directiva-inicio-bosque .di-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 15px;
        }

        .directiva-inicio-bosque .di-title {
          margin-bottom: 0;
          font-size: clamp(30px,3vw,42px);
          font-weight: 700;
        }

        /* ETIQUETAS */

        .directiva-inicio-bosque .di-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 16px;

          border: 1px solid rgba(215,172,50,0.50);
          border-radius: 999px;

          background: rgba(215,172,50,0.15);
          color: #e9c454;

          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .directiva-inicio-bosque .di-badge-green {
          background: rgba(28,125,78,0.20);
          border-color: rgba(80,183,125,0.55);
          color: #a6eac4;
        }

        .directiva-inicio-bosque .di-badge-muted {
          background: rgba(230,230,210,0.08);
          border-color: rgba(220,220,200,0.25);
          color: #e6e9df;
        }

        .directiva-inicio-bosque .di-badge-pending {
          background: rgba(215,172,50,0.14);
          border-color: rgba(240,211,117,0.48);
          color: #f0d375;
          font-size: 12px;
          white-space: normal;
          text-align: center;
        }

        /* BOTONES DE SESION */

        .directiva-inicio-bosque .di-session-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .directiva-inicio-bosque
        .di-session-actions button {
          min-height: 48px !important;
          padding: 12px 23px !important;
          background: rgba(215,172,50,0.22) !important;
          border: 1.5px solid #d7ac32 !important;
          border-radius: 13px !important;
          color: #f8e8b4 !important;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 15px !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.22);
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .directiva-inicio-bosque
        .di-session-actions button:hover {
          background: #d7ac32 !important;
          color: #102419 !important;
          transform: translateY(-2px);
        }

        /* ALERTAS */

        .directiva-inicio-bosque .di-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 18px 22px;
          border-radius: 15px;
          font-size: 15px;
          line-height: 1.6;
        }

        .directiva-inicio-bosque .di-alert-error {
          background: rgba(118,33,35,0.85);
          border: 1px solid rgba(231,104,104,0.50);
          color: #ffe4e4;
        }

        .directiva-inicio-bosque .di-alert-loading {
          background: rgba(8,29,19,0.78);
          border: 1px solid rgba(215,172,50,0.35);
          color: #f6efd9;
        }

        .directiva-inicio-bosque .di-alert-pending {
          background: rgba(45,42,19,0.79);
          border: 1px solid rgba(215,172,50,0.40);
          color: #f6efd9;
        }

        /* JUNTA DE VECINOS */

        .directiva-inicio-bosque .di-junta {
          padding: 28px 30px;
          margin-bottom: 28px;
        }

        .directiva-inicio-bosque .di-junta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .directiva-inicio-bosque .di-eyebrow {
          margin: 0 0 10px;
          color: #e9c454;
          font-size: 12px;
          font-weight: 750;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .directiva-inicio-bosque .di-junta-title {
          margin: 0 0 12px;
          font-size: clamp(24px,2.5vw,33px);
        }

        .directiva-inicio-bosque .di-junta-date {
          margin: 0;
          color: #cbd2c4;
          font-size: 15px;
        }

        .directiva-inicio-bosque .di-junta-date strong {
          color: #f0d375;
        }

        /* MODULOS */

        .directiva-inicio-bosque .di-section-heading {
          margin: 0 0 12px;
          font-size: 30px;
        }

        .directiva-inicio-bosque .di-modules-section {
          margin-bottom: 32px;
        }

        .directiva-inicio-bosque .di-modules-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 20px;
          margin-top: 22px;
        }

        .directiva-inicio-bosque .di-module {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 285px;
          padding: 25px;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .directiva-inicio-bosque
        .di-module:not(.di-module-disabled):hover {
          transform: translateY(-3px);
          background: rgba(12,43,26,0.82);
          border-color: rgba(215,172,50,0.70);
        }

        /* MODULO PENDIENTE */

        .directiva-inicio-bosque .di-module-disabled {
          background: rgba(8,29,19,0.73);
          border-color: rgba(215,172,50,0.23);
        }

        .directiva-inicio-bosque .di-module-icon {
          display: grid;
          place-items: center;
          width: 55px;
          height: 55px;
          margin-bottom: 20px;
          border-radius: 16px;
          background: rgba(215,172,50,0.17);
          color: #e9c454;
          font-size: 23px;
          font-weight: 800;
        }

        .directiva-inicio-bosque .di-module-content {
          flex: 1;
        }

        .directiva-inicio-bosque .di-module-title {
          margin: 0 0 12px;
          font-size: 23px;
          font-weight: 700;
        }

        .directiva-inicio-bosque .di-module-description {
          margin: 0 0 18px;
          color: #cbd2c4;
          font-size: 14px;
          line-height: 1.7;
        }

        .directiva-inicio-bosque .di-module-status {
          margin-bottom: 18px;
        }

        /* BOTONES ACTIVOS */

        .directiva-inicio-bosque .di-module-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 49px;
          padding: 12px 16px;
          border: 1px solid #d7ac32;
          border-radius: 999px;

          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );

          color: #102419;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.20);

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .directiva-inicio-bosque
        a.di-module-button:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        /* BOTONES PENDIENTES */

        .directiva-inicio-bosque
        .di-module-button-disabled {
          background: rgba(215,172,50,0.12);
          color: #e5d5a2;
          border: 1px solid rgba(215,172,50,0.38);
          box-shadow: none;
          cursor: not-allowed;
        }

        .directiva-inicio-bosque
        .di-module-button-disabled:disabled {
          opacity: 1;
        }

        /* INTEGRANTES */

        .directiva-inicio-bosque .di-members-panel {
          overflow: hidden;
          margin-bottom: 24px;
        }

        .directiva-inicio-bosque .di-members-header {
          padding: 26px 30px;
          border-bottom: 1px solid rgba(215,172,50,0.20);
        }

        .directiva-inicio-bosque .di-members-heading {
          margin: 0 0 10px;
          font-size: 29px;
        }

        .directiva-inicio-bosque .di-members-scroll {
          overflow-x: auto;
        }

        .directiva-inicio-bosque .di-table {
          width: 100%;
          border-collapse: collapse;
          color: #f6efd9;
          font-size: 14px;
        }

        .directiva-inicio-bosque .di-table thead {
          background: rgba(215,172,50,0.12);
        }

        .directiva-inicio-bosque .di-table th {
          padding: 19px 23px;
          color: #ebce70;
          text-align: left;
          font-weight: 750;
        }

        .directiva-inicio-bosque .di-table td {
          padding: 19px 23px;
          border-top: 1px solid rgba(215,172,50,0.15);
          vertical-align: middle;
        }

        .directiva-inicio-bosque
        .di-table tbody tr:hover {
          background: rgba(215,172,50,0.07);
        }

        .directiva-inicio-bosque .di-member-name {
          font-weight: 700;
          color: #f6efd9;
        }

        .directiva-inicio-bosque .di-member-user {
          color: #cbd2c4;
        }

        .directiva-inicio-bosque .di-member-empty {
          padding: 35px;
          color: #cbd2c4;
          text-align: center;
        }

        /* ACCESIBILIDAD */

        .directiva-inicio-bosque a:focus-visible,
        .directiva-inicio-bosque button:focus-visible {
          outline: 2px solid #f0d375;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .directiva-inicio-bosque .di-modules-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width: 700px) {
          .directiva-inicio-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .directiva-inicio-bosque .di-header,
          .directiva-inicio-bosque .di-junta,
          .directiva-inicio-bosque .di-members-header {
            padding: 23px;
          }

          .directiva-inicio-bosque .di-modules-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .directiva-inicio-bosque .di-module {
            min-height: 0;
            padding: 22px;
          }

          .directiva-inicio-bosque .di-session-actions {
            width: 100%;
          }

          .directiva-inicio-bosque
          .di-session-actions button {
            min-width: 150px;
          }

          .directiva-inicio-bosque .di-table th,
          .directiva-inicio-bosque .di-table td {
            padding: 15px;
          }
        }
      `}</style>

      <section className="di-container">

        {/* ENCABEZADO */}

        <header className="di-panel di-header">
          <div className="di-header-row">

            <div>
              <div className="di-title-row">
                <h1 className="di-title">
                  Panel de Directiva
                </h1>

                <span className="di-badge">
                  Directiva
                </span>
              </div>

              <p className="di-subtitle">
                Gestión y administración de la Junta de Vecinos.
              </p>
            </div>

            <div className="di-session-actions">
              <CambiarPerfilButton />
              <CerrarSesionButton />
            </div>

          </div>
        </header>

        {/* ESTADO DE CARGA */}

        {cargando && (
          <div
            className="di-alert di-alert-loading"
            role="status"
          >
            <span className="loading loading-spinner loading-sm" />
            <span>
              Cargando información de la directiva...
            </span>
          </div>
        )}

        {/* MENSAJES DE ERROR */}

        {error && (
          <div
            className="di-alert di-alert-error"
            role="alert"
          >
            <span>{error}</span>
          </div>
        )}

        {/* INFORMACION DE JUNTA VIGENTE */}

        {habilitada && directivaVigente && (
          <div className="di-panel di-junta">
            <div className="di-junta-row">

              <div>
                <p className="di-eyebrow">
                  Junta de Vecinos
                </p>

                <h2 className="di-junta-title">
                  {directivaVigente.directiva.junta_nombre}
                </h2>

                <p className="di-junta-date">
                  Directiva vigente desde{' '}
                  <strong>
                    {formatearFecha(
                      directivaVigente.directiva.fecha_inicio,
                    )}
                  </strong>
                </p>
              </div>

              <span className="di-badge di-badge-green">
                Vigente
              </span>

            </div>
          </div>
        )}

        {/* AVISO DE MODULOS PENDIENTES */}

        {!cargando && !habilitada && (
          <div
            className="di-alert di-alert-pending"
            role="status"
          >
            <span style={{ fontSize: '24px' }}>
              ◷
            </span>

            <div>
              <strong>
                Módulos pendientes de habilitación
              </strong>

              <p style={{ margin: '5px 0 0' }}>
                Puedes visualizar las funciones disponibles
                para la Directiva. Se habilitarán cuando
                se confirme una directiva vigente asociada
                a tu cuenta.
              </p>
            </div>
          </div>
        )}

        {/* MODULOS SIEMPRE VISIBLES */}

        <section className="di-modules-section">

          <h2 className="di-section-heading">
            Módulos de gestión
          </h2>

          <p className="di-subtitle">
            {habilitada
              ? 'Selecciona el área que deseas administrar.'
              : 'Conoce las áreas disponibles. Los accesos estarán habilitados cuando tengas una directiva vigente.'}
          </p>

          <div className="di-modules-grid">

            {modulos.map((modulo) => (
              <article
                className={`di-panel di-module ${
                  !habilitada ? 'di-module-disabled' : ''
                }`}
                key={modulo.ruta}
              >

                <div className="di-module-icon">
                  {modulo.letra}
                </div>

                <div className="di-module-content">

                  <h3 className="di-module-title">
                    {modulo.titulo}
                  </h3>

                  <p className="di-module-description">
                    {modulo.descripcion}
                  </p>

                  <div className="di-module-status">
                    {habilitada ? (
                      <span className="di-badge di-badge-green">
                        Disponible
                      </span>
                    ) : (
                      <span className="di-badge di-badge-pending">
                        Pendiente de habilitación
                      </span>
                    )}
                  </div>

                </div>

                {habilitada ? (
                  <Link
                    to={modulo.ruta}
                    className="di-module-button"
                  >
                    {modulo.boton}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="di-module-button di-module-button-disabled"
                    disabled
                    title="Requiere una directiva vigente"
                  >
                    Pendiente de habilitación
                  </button>
                )}

              </article>
            ))}

          </div>
        </section>

        {/* INTEGRANTES SOLO CON DIRECTIVA VIGENTE */}

        {habilitada && directivaVigente && (
          <section className="di-panel di-members-panel">

            <div className="di-members-header">
              <div className="di-header-row">

                <div>
                  <h2 className="di-members-heading">
                    Integrantes de la Directiva
                  </h2>

                  <p className="di-subtitle">
                    Miembros activos de la directiva vigente.
                  </p>
                </div>

                <span className="di-badge">
                  {directivaVigente.integrantes.filter(
                    (integrante) => integrante.activo,
                  ).length}{' '}
                  integrantes activos
                </span>

              </div>
            </div>

            {directivaVigente.integrantes.length === 0 ? (

              <div className="di-member-empty">
                No existen integrantes registrados
                para esta directiva.
              </div>

            ) : (

              <div className="di-members-scroll">
                <table className="di-table">

                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Usuario</th>
                      <th>Cargo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {directivaVigente.integrantes.map(
                      (integrante) => (
                        <tr key={integrante.id}>

                          <td className="di-member-name">
                            {[
                              integrante.usuario_nombres,
                              integrante.usuario_apellido_paterno,
                            ]
                              .filter(Boolean)
                              .join(' ') || '-'}
                          </td>

                          <td className="di-member-user">
                            {integrante.usuario_username}
                          </td>

                          <td>
                            <span className="di-badge">
                              {integrante.cargo_nombre}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                integrante.activo
                                  ? 'di-badge di-badge-green'
                                  : 'di-badge di-badge-muted'
                              }
                            >
                              {integrante.activo
                                ? 'Activo'
                                : 'Inactivo'}
                            </span>
                          </td>

                        </tr>
                      ),
                    )}
                  </tbody>

                </table>
              </div>

            )}

          </section>
        )}

      </section>
    </main>
  )
}

export default DirectivaInicioPage
