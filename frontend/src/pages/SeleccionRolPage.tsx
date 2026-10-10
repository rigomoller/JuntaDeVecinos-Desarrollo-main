
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CerrarSesionButton from '../components/auth/CerrarSesionButton'

type Sesion = {
  roles: number[]
}

type Perfil = {
  id: number
  nombre: string
  inicial: string
  subtitulo: string
  descripcion: string
  etiqueta: string
  funciones: string[]
  ruta: string
}

const API = 'http://localhost:8000'

const perfiles: Perfil[] = [
  {
    id: 3,
    nombre: 'Vecino',
    inicial: 'V',
    subtitulo: 'Participación y servicios comunitarios',
    descripcion:
      'Accede a las funciones disponibles para vecinos y realiza tus gestiones directamente con la Junta de Vecinos.',
    etiqueta: 'Funciones principales',
    funciones: [
      'Actividades y eventos',
      'Consultas, reclamos y solicitudes',
      'Solicitud de documentos',
      'Perfil personal',
    ],
    ruta: '/vecino',
  },
  {
    id: 2,
    nombre: 'Directiva',
    inicial: 'D',
    subtitulo: 'Gestión de la Junta de Vecinos',
    descripcion:
      'Accede a las herramientas de administración y gestión operativa de la Directiva.',
    etiqueta: 'Funciones principales',
    funciones: [
      'Gestión de Directiva',
      'Comunicados',
      'Actividades y eventos',
      'Consultas y solicitudes',
      'Solicitudes de documentos',
    ],
    ruta: '/directiva',
  },
  {
    id: 1,
    nombre: 'Administrador',
    inicial: 'A',
    subtitulo: 'Administración general de la plataforma',
    descripcion:
      'Accede a la configuración general, gestión de usuarios, roles y administración global de la plataforma.',
    etiqueta: 'Alcance',
    funciones: [
      'Gestión de usuarios',
      'Roles y permisos',
      'Configuración general',
    ],
    ruta: '/admin',
  },
  {
    id: 4,
    nombre: 'Municipal',
    inicial: 'M',
    subtitulo: 'Funciones de gestión municipal',
    descripcion:
      'Accede a las funciones municipales disponibles dentro de la plataforma.',
    etiqueta: 'Perfil municipal',
    funciones: [
      'Acceso a herramientas municipales',
    ],
    ruta: '/municipal',
  },
]

function SeleccionRolPage() {
  const navigate = useNavigate()

  const [roles, setRoles] = useState<number[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // CARGAR SESIÓN Y ROLES

  useEffect(() => {
    const controlador = new AbortController()

    const cargarSesion = async () => {
      try {
        const response = await fetch(
          `${API}/api/auth/sesion/`,
          {
            credentials: 'include',
            signal: controlador.signal,
          }
        )

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              'Tu sesión no está activa. Inicia sesión nuevamente.'
            )
          }

          if (response.status === 403) {
            throw new Error(
              'No tienes autorización para consultar los perfiles.'
            )
          }

          throw new Error(
            `No fue posible obtener la sesión del usuario. Error ${response.status}.`
          )
        }

        const data = (await response.json()) as Sesion

        if (!controlador.signal.aborted) {
          if (!Array.isArray(data.roles)) {
            throw new Error(
              'El servidor no devolvió una lista de roles válida.'
            )
          }

          setRoles(data.roles)
          setError('')
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error inesperado.'
          )
        }
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false)
        }
      }
    }

    void cargarSesion()

    return () => controlador.abort()
  }, [])

  const perfilesDisponibles = perfiles.filter(
    (perfil) => roles.includes(perfil.id)
  )

  const entrarPerfil = (perfil: Perfil) => {
    if (!roles.includes(perfil.id)) return

    navigate(perfil.ruta)
  }

  return (
    <main className="seleccion-rol-bosque">
      <style>{`
        /* FONDO GENERAL */

        .seleccion-rol-bosque {
          --sr-oro: #d7ac32;
          --sr-crema: #f6efd9;
          --sr-suave: #cbd2c4;

          min-height: 100vh;
          width: 100%;
          padding: 34px 22px;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/vecino-inicio.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;

          color: var(--sr-crema);
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .seleccion-rol-bosque,
        .seleccion-rol-bosque *,
        .seleccion-rol-bosque *::before,
        .seleccion-rol-bosque *::after {
          box-sizing: border-box;
        }

        .seleccion-rol-bosque .sr-container {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
        }

        /* PANELES TRANSPARENTES */

        .seleccion-rol-bosque .sr-panel {
          background: rgba(8, 29, 19, 0.74);
          border: 1px solid rgba(215, 172, 50, 0.38);
          border-radius: 22px;

          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.20);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        /* TIPOGRAFÍA */

        .seleccion-rol-bosque h1,
        .seleccion-rol-bosque h2,
        .seleccion-rol-bosque h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: var(--sr-crema);
          line-height: 1.25;
        }

        .seleccion-rol-bosque .sr-title {
          margin: 0;
          font-size: clamp(32px, 3vw, 43px);
        }

        .seleccion-rol-bosque .sr-heading {
          margin: 0;
          font-size: 30px;
        }

        .seleccion-rol-bosque .sr-subtitle {
          color: var(--sr-suave);
          font-size: 15px;
          line-height: 1.8;
          margin: 10px 0 0;
        }

        /* ENCABEZADO */

        .seleccion-rol-bosque .sr-header {
          padding: 32px;
          margin-bottom: 27px;
        }

        .seleccion-rol-bosque .sr-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .seleccion-rol-bosque .sr-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 10px;
        }

        /* ETIQUETAS */

        .seleccion-rol-bosque .sr-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 16px;

          border: 1px solid rgba(215, 172, 50, 0.55);
          border-radius: 999px;
          background: rgba(215, 172, 50, 0.16);

          color: #edce70;
          font-size: 13px;
          font-weight: 700;
        }

        .seleccion-rol-bosque .sr-badge-success {
          background: rgba(28, 125, 78, 0.23);
          border-color: rgba(80, 183, 125, 0.58);
          color: #a6eac4;
        }

        /* CERRAR SESIÓN */

        .seleccion-rol-bosque .sr-logout button {
          min-height: 48px;
          padding: 11px 22px;

          border: 1px solid #d7ac32;
          border-radius: 12px;

          background: rgba(215, 172, 50, 0.23);
          color: #f6efd9;

          font-size: 14px;
          font-weight: 750;
          cursor: pointer;

          transition: all 0.2s ease;
        }

        .seleccion-rol-bosque .sr-logout button:hover {
          background: #e4c55b;
          color: #102419;
          transform: translateY(-2px);
        }

        /* ESTADÍSTICAS */

        .seleccion-rol-bosque .sr-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 31px;
        }

        .seleccion-rol-bosque .sr-stat {
          padding: 25px;
        }

        .seleccion-rol-bosque .sr-stat-label {
          margin: 0 0 18px;
          color: #cbd2c4;
          font-size: 15px;
          font-weight: 600;
        }

        .seleccion-rol-bosque .sr-stat-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .seleccion-rol-bosque .sr-stat-number {
          color: #d7ac32;
          font-size: 36px;
          line-height: 1;
          font-weight: 800;
        }

        .seleccion-rol-bosque .sr-stat-value {
          color: #f6efd9;
          font-size: 23px;
          font-weight: 750;
        }

        /* SECCIÓN DE PERFILES */

        .seleccion-rol-bosque .sr-section-heading {
          margin-bottom: 22px;
        }

        .seleccion-rol-bosque .sr-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 23px;
        }

        .seleccion-rol-bosque .sr-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;

          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .seleccion-rol-bosque .sr-card:hover {
          transform: translateY(-4px);
          border-color: rgba(215, 172, 50, 0.75);
        }

        .seleccion-rol-bosque .sr-card-body {
          flex: 1;
          padding: 29px;
        }

        .seleccion-rol-bosque .sr-card-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }

        .seleccion-rol-bosque .sr-profile {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .seleccion-rol-bosque .sr-profile-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;

          width: 58px;
          height: 58px;
          border-radius: 15px;

          background: rgba(215, 172, 50, 0.19);
          border: 1px solid rgba(215, 172, 50, 0.35);

          color: #edce70;
          font-size: 26px;
          font-weight: 800;
        }

        .seleccion-rol-bosque .sr-card-title {
          margin: 0;
          font-size: 27px;
        }

        .seleccion-rol-bosque .sr-card-subtitle {
          margin: 7px 0 0;
          color: #cbd2c4;
          font-size: 13px;
          line-height: 1.5;
        }

        .seleccion-rol-bosque .sr-description {
          margin: 0 0 24px;
          color: #d3d9cb;
          font-size: 15px;
          line-height: 1.8;
        }

        /* FUNCIONES PRINCIPALES */

        .seleccion-rol-bosque .sr-features {
          padding: 20px;
          border-radius: 15px;

          background: rgba(3, 20, 12, 0.48);
          border: 1px solid rgba(215, 172, 50, 0.19);
        }

        .seleccion-rol-bosque .sr-features-title {
          margin: 0 0 15px;
          color: #e4d6a3;
          font-size: 12px;
          font-weight: 750;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .seleccion-rol-bosque .sr-feature-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .seleccion-rol-bosque .sr-feature {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #dce3d8;
          font-size: 14px;
          line-height: 1.5;
        }

        .seleccion-rol-bosque .sr-dot {
          width: 9px;
          height: 9px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #d7ac32;
        }

        /* BOTONES DORADOS */

        .seleccion-rol-bosque .sr-card-footer {
          padding: 22px 29px;
          border-top: 1px solid rgba(215, 172, 50, 0.23);
          background: rgba(3, 20, 12, 0.18);
        }

        .seleccion-rol-bosque .sr-button {
          display: flex;
          justify-content: center;
          align-items: center;

          width: 100%;
          min-height: 52px;
          padding: 13px 20px;

          border: 1px solid #d7ac32;
          border-radius: 15px;

          background: linear-gradient(
            115deg,
            #e4c55b,
            #c49a28
          );

          color: #102419;
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 15px;
          font-weight: 800;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .seleccion-rol-bosque .sr-button:hover {
          background: linear-gradient(
            115deg,
            #f0d67c,
            #dfb646
          );
          color: #102419;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(215, 172, 50, 0.20);
        }

        /* ERRORES Y ESTADOS */

        .seleccion-rol-bosque .sr-alert {
          padding: 20px;
          margin-bottom: 25px;
          border-radius: 14px;

          background: rgba(118, 33, 35, 0.85);
          border: 1px solid rgba(231, 104, 104, 0.55);

          color: #ffe4e4;
          font-size: 14px;
          line-height: 1.7;
        }

        .seleccion-rol-bosque .sr-empty {
          padding: 55px 25px;
          text-align: center;
        }

        .seleccion-rol-bosque .sr-empty-icon {
          display: grid;
          place-items: center;

          width: 70px;
          height: 70px;
          margin: 0 auto 20px;
          border-radius: 50%;

          background: rgba(215, 172, 50, 0.17);
          color: #edce70;
          font-size: 29px;
          font-weight: 800;
        }

        .seleccion-rol-bosque .sr-empty h3 {
          margin: 0 0 12px;
          font-size: 26px;
        }

        .seleccion-rol-bosque .sr-empty p {
          max-width: 500px;
          margin: 0 auto;
          color: #cbd2c4;
          line-height: 1.8;
        }

        .seleccion-rol-bosque .sr-loading {
          padding: 60px 25px;
          text-align: center;
        }

        .seleccion-rol-bosque .sr-spinner {
          display: inline-block;
          width: 42px;
          height: 42px;
          margin-bottom: 18px;
          border: 4px solid rgba(215, 172, 50, 0.20);
          border-top-color: #e4c55b;
          border-radius: 50%;
          animation: sr-spin 0.9s linear infinite;
        }

        @keyframes sr-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .seleccion-rol-bosque button:focus-visible {
          outline: 2px solid #f0d375;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media (max-width: 950px) {
          .seleccion-rol-bosque .sr-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .seleccion-rol-bosque .sr-stats {
            grid-template-columns: 1fr;
            gap: 13px;
          }
        }

        @media (max-width: 600px) {
          .seleccion-rol-bosque {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .seleccion-rol-bosque .sr-header,
          .seleccion-rol-bosque .sr-card-body {
            padding: 22px;
          }

          .seleccion-rol-bosque .sr-card-footer {
            padding: 18px 22px;
          }

          .seleccion-rol-bosque .sr-logout {
            width: 100%;
          }

          .seleccion-rol-bosque .sr-logout button {
            width: 100%;
          }
        }
      `}</style>

      <section className="sr-container">

        {/* ENCABEZADO */}

        <header className="sr-panel sr-header">
          <div className="sr-row">
            <div>
              <div className="sr-title-row">
                <h1 className="sr-title">
                  Seleccionar perfil
                </h1>

                <span className="sr-badge">
                  Acceso
                </span>
              </div>

              <p className="sr-subtitle">
                Elige el perfil con el que deseas trabajar.
                Cada perfil habilita funciones diferentes
                dentro de la plataforma.
              </p>
            </div>

            <div className="sr-logout">
              <CerrarSesionButton />
            </div>
          </div>
        </header>

        {/* CARGANDO */}

        {cargando && (
          <div className="sr-panel sr-loading" role="status">
            <div className="sr-spinner" />

            <p className="sr-subtitle">
              Cargando perfiles disponibles...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!cargando && error && (
          <div className="sr-alert" role="alert">
            <strong>No fue posible cargar los perfiles.</strong>
            <p style={{ margin: '8px 0 0' }}>
              {error}
            </p>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}

        {!cargando && !error && (
          <>
            {/* INDICADORES */}

            <div className="sr-stats">

              <div className="sr-panel sr-stat">
                <p className="sr-stat-label">
                  Perfiles disponibles
                </p>

                <div className="sr-stat-bottom">
                  <span className="sr-stat-number">
                    {roles.length}
                  </span>

                  <span className="sr-badge">
                    Habilitados
                  </span>
                </div>
              </div>

              <div className="sr-panel sr-stat">
                <p className="sr-stat-label">
                  Estado de sesión
                </p>

                <div className="sr-stat-bottom">
                  <span className="sr-stat-value">
                    Activa
                  </span>

                  <span className="sr-badge sr-badge-success">
                    Conectado
                  </span>
                </div>
              </div>

              <div className="sr-panel sr-stat">
                <p className="sr-stat-label">
                  Acceso
                </p>

                <div className="sr-stat-bottom">
                  <span className="sr-stat-value">
                    Según rol
                  </span>

                  <span className="sr-badge">
                    Seguro
                  </span>
                </div>
              </div>

            </div>

            {/* TÍTULO DE SECCIÓN */}

            <div className="sr-section-heading">
              <h2 className="sr-heading">
                Perfiles disponibles
              </h2>

              <p className="sr-subtitle">
                Selecciona uno de los perfiles
                habilitados para tu cuenta.
              </p>
            </div>

            {/* SIN PERFILES */}

            {perfilesDisponibles.length === 0 && (
              <div className="sr-panel sr-empty">
                <div className="sr-empty-icon">
                  !
                </div>

                <h3>
                  No tienes perfiles disponibles
                </h3>

                <p>
                  Tu cuenta no tiene roles habilitados
                  para ingresar a la plataforma.
                </p>
              </div>
            )}

            {/* TARJETAS DE PERFILES */}

            {perfilesDisponibles.length > 0 && (
              <div className="sr-grid">

                {perfilesDisponibles.map((perfil) => (
                  <article
                    key={perfil.id}
                    className="sr-panel sr-card"
                  >
                    <div className="sr-card-body">

                      {/* PERFIL */}

                      <div className="sr-card-heading">
                        <div className="sr-profile">
                          <div className="sr-profile-icon">
                            {perfil.inicial}
                          </div>

                          <div>
                            <h3 className="sr-card-title">
                              {perfil.nombre}
                            </h3>

                            <p className="sr-card-subtitle">
                              {perfil.subtitulo}
                            </p>
                          </div>
                        </div>

                        <span className="sr-badge sr-badge-success">
                          Disponible
                        </span>
                      </div>

                      {/* DESCRIPCIÓN */}

                      <p className="sr-description">
                        {perfil.descripcion}
                      </p>

                      {/* FUNCIONES */}

                      <div className="sr-features">
                        <p className="sr-features-title">
                          {perfil.etiqueta}
                        </p>

                        <div className="sr-feature-list">
                          {perfil.funciones.map((funcion) => (
                            <div
                              key={funcion}
                              className="sr-feature"
                            >
                              <span className="sr-dot" />
                              <span>{funcion}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* BOTÓN ENTRAR */}

                    <div className="sr-card-footer">
                      <button
                        type="button"
                        className="sr-button"
                        onClick={() => entrarPerfil(perfil)}
                      >
                        Entrar como {perfil.nombre}
                      </button>
                    </div>
                  </article>
                ))}

              </div>
            )}

          </>
        )}

      </section>
    </main>
  )
}

export default SeleccionRolPage
