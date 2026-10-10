
import CerrarSesionButton from '../../components/auth/CerrarSesionButton'
import { Link } from 'react-router-dom'

function AdminInicioPage() {
  return (
    <main className="admin-inicio-page min-h-screen px-4 py-8">
      <style>{`
        .admin-inicio-page {
          min-height: 100vh;

          background:
            linear-gradient(
              rgba(9, 31, 23, 0.55),
              rgba(9, 31, 23, 0.55)
            ),
            url('/base-datos.webp') center / cover no-repeat fixed,
            #0a1f18;

          color: #f5f1e6;
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        /* TITULOS */

        .admin-inicio-page h1,
        .admin-inicio-page h2,
        .admin-inicio-page h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #f2e8c9;
        }

        /* PANEL PRINCIPAL */

        .admin-inicio-panel {
          background: rgba(9, 31, 23, 0.48);

          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);

          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 1rem;
        }

        /* TARJETAS */

        .admin-inicio-tarjeta {
          background: rgba(9, 31, 23, 0.48);

          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);

          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 1rem;

          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }

        .admin-inicio-tarjeta:hover {
          transform: translateY(-2px);
          border-color: rgba(212, 175, 55, 0.6);
        }

        /* ICONOS */

        .admin-inicio-icono {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
        }

        /* ETIQUETAS */

        .admin-inicio-etiqueta {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;

          border: 1px solid rgba(212, 175, 55, 0.45);
          border-radius: 9999px;

          padding: 0.25rem 0.9rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* BOTONES DE MODULOS */

        .admin-inicio-boton {
          background:
            linear-gradient(135deg, #d4af37, #b8912a);

          color: #0a1f18;
          border: none;
          border-radius: 9999px;

          font-weight: 700;
          width: 100%;

          transition:
            filter 0.2s ease,
            transform 0.2s ease;
        }

        .admin-inicio-boton:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);

          background:
            linear-gradient(135deg, #d4af37, #b8912a);

          color: #0a1f18;
          border: none;
        }

        /* TEXTO SECUNDARIO */

        .admin-inicio-texto-suave {
          color: rgba(245, 241, 230, 0.75);
        }

        /* CONTENEDOR DE BOTONES SUPERIORES */

        .admin-inicio-acciones {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* BOTON CAMBIAR PERFIL */

        .admin-inicio-page .admin-cambiar-perfil {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 48px;
          padding: 12px 24px;

          background: rgba(215, 172, 50, 0.22);
          color: #f8e8b4;

          border: 1.5px solid #d7ac32;
          border-radius: 12px;

          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.2px;
          text-decoration: none;

          box-shadow:
            0 4px 15px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .admin-inicio-page .admin-cambiar-perfil:hover {
          background: #d7ac32;
          color: #102419;

          transform: translateY(-2px);

          box-shadow:
            0 6px 20px rgba(215, 172, 50, 0.25);
        }

        .admin-inicio-page .admin-cambiar-perfil:active {
          transform: translateY(0);
          background: #c49a28;
          color: #102419;
        }

        .admin-inicio-page .admin-cambiar-perfil:focus-visible {
          outline: 2px solid #f6efd9;
          outline-offset: 3px;
        }

        /* BOTON CERRAR SESION */

        .admin-inicio-page .admin-cerrar-sesion {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-inicio-page .admin-cerrar-sesion button {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;

          min-height: 48px !important;
          padding: 12px 24px !important;

          background: rgba(215, 172, 50, 0.22) !important;
          color: #f8e8b4 !important;

          border: 1.5px solid #d7ac32 !important;
          border-radius: 12px !important;

          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 15px !important;
          font-weight: 700 !important;
          letter-spacing: 0.2px;

          text-shadow: none !important;

          box-shadow:
            0 4px 15px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .admin-inicio-page .admin-cerrar-sesion button:hover {
          background: #d7ac32 !important;
          color: #102419 !important;

          border-color: #e8c657 !important;

          transform: translateY(-2px);

          box-shadow:
            0 6px 20px rgba(215, 172, 50, 0.25);
        }

        .admin-inicio-page .admin-cerrar-sesion button:active {
          transform: translateY(0);
          background: #c49a28 !important;
          color: #102419 !important;
        }

        .admin-inicio-page .admin-cerrar-sesion button:focus-visible {
          outline: 2px solid #f6efd9;
          outline-offset: 3px;
        }

        /* RESPONSIVE */

        @media (max-width: 640px) {
          .admin-inicio-page {
            background-attachment: scroll;
          }

          .admin-inicio-acciones {
            width: 100%;
            justify-content: stretch;
          }

          .admin-inicio-page .admin-cambiar-perfil {
            flex: 1;
            text-align: center;
          }

          .admin-inicio-page .admin-cerrar-sesion {
            flex: 1;
          }

          .admin-inicio-page .admin-cerrar-sesion button {
            width: 100%;
          }
        }
      `}</style>

      <section className="mx-auto w-full max-w-6xl">

        {/* ENCABEZADO */}

        <div className="admin-inicio-panel mb-6 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Panel de Administración
                </h1>

                <span className="admin-inicio-etiqueta">
                  Administrador
                </span>
              </div>

              <p className="admin-inicio-texto-suave max-w-2xl text-base">
                Administra usuarios, estructura territorial,
                cargos y directivas de la plataforma.
              </p>
            </div>

            {/* BOTONES DE NAVEGACION Y SESION */}

            <div className="admin-inicio-acciones">

              <Link
                to="/seleccionar-perfil"
                className="admin-cambiar-perfil"
              >
                ← Cambiar perfil
              </Link>

              <div className="admin-cerrar-sesion">
                <CerrarSesionButton />
              </div>

            </div>

          </div>
        </div>

        {/* RESUMEN */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* MODULOS DISPONIBLES */}

          <div className="admin-inicio-tarjeta p-5 shadow-sm">
            <p className="admin-inicio-texto-suave text-sm font-medium">
              Módulos disponibles
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span
                className="text-3xl font-bold"
                style={{ color: '#d4af37' }}
              >
                6
              </span>

              <span className="admin-inicio-etiqueta">
                Administración
              </span>
            </div>
          </div>

          {/* PERFIL ACTIVO */}

          <div className="admin-inicio-tarjeta p-5 shadow-sm">
            <p className="admin-inicio-texto-suave text-sm font-medium">
              Perfil activo
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-xl font-bold">
                Administrador
              </span>

              <span className="admin-inicio-etiqueta">
                Acceso global
              </span>
            </div>
          </div>

          {/* ESTADO */}

          <div className="admin-inicio-tarjeta p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="admin-inicio-texto-suave text-sm font-medium">
              Estado
            </p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <span className="text-xl font-bold">
                Sesión activa
              </span>

              <span className="admin-inicio-etiqueta">
                Conectado
              </span>
            </div>
          </div>

        </div>

        {/* MODULOS DE ADMINISTRACION */}

        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            Módulos de administración
          </h2>

          <p className="admin-inicio-texto-suave mt-1 text-base">
            Selecciona el área que deseas gestionar.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* USUARIOS */}

          <div className="admin-inicio-tarjeta flex h-full flex-col p-5">
            <div className="mb-5 flex-1">
              <div className="admin-inicio-icono mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold">
                U
              </div>

              <h3 className="text-lg font-bold">
                Gestión de Usuarios
              </h3>

              <p className="admin-inicio-texto-suave mt-2 text-sm leading-relaxed">
                Administra cuentas, estados y roles de los
                usuarios de la plataforma.
              </p>
            </div>

            <Link
              to="/admin/usuarios"
              className="admin-inicio-boton btn"
            >
              Gestionar Usuarios
            </Link>
          </div>

          {/* JUNTAS DE VECINOS */}

          <div className="admin-inicio-tarjeta flex h-full flex-col p-5">
            <div className="mb-5 flex-1">
              <div className="admin-inicio-icono mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold">
                J
              </div>

              <h3 className="text-lg font-bold">
                Juntas de Vecinos
              </h3>

              <p className="admin-inicio-texto-suave mt-2 text-sm leading-relaxed">
                Administra las Juntas de Vecinos registradas
                en el sistema.
              </p>
            </div>

            <Link
              to="/admin/juntas"
              className="admin-inicio-boton btn"
            >
              Gestionar Juntas
            </Link>
          </div>

          {/* SECTORES */}

          <div className="admin-inicio-tarjeta flex h-full flex-col p-5">
            <div className="mb-5 flex-1">
              <div className="admin-inicio-icono mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold">
                S
              </div>

              <h3 className="text-lg font-bold">
                Sectores
              </h3>

              <p className="admin-inicio-texto-suave mt-2 text-sm leading-relaxed">
                Define y administra los sectores territoriales
                asociados a cada Junta de Vecinos.
              </p>
            </div>

            <Link
              to="/admin/sectores"
              className="admin-inicio-boton btn"
            >
              Gestionar Sectores
            </Link>
          </div>

          {/* ASOCIACIONES */}

          <div className="admin-inicio-tarjeta flex h-full flex-col p-5">
            <div className="mb-5 flex-1">
              <div className="admin-inicio-icono mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold">
                A
              </div>

              <h3 className="text-lg font-bold">
                Asociaciones por Sector
              </h3>

              <p className="admin-inicio-texto-suave mt-2 text-sm leading-relaxed">
                Revisa y gestiona las solicitudes de asociación
                territorial realizadas por los vecinos.
              </p>
            </div>

            <Link
              to="/admin/asociaciones"
              className="admin-inicio-boton btn"
            >
              Gestionar Asociaciones
            </Link>
          </div>

          {/* CARGOS */}

          <div className="admin-inicio-tarjeta flex h-full flex-col p-5">
            <div className="mb-5 flex-1">
              <div className="admin-inicio-icono mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold">
                C
              </div>

              <h3 className="text-lg font-bold">
                Gestión de Cargos
              </h3>

              <p className="admin-inicio-texto-suave mt-2 text-sm leading-relaxed">
                Configura los cargos disponibles para la
                conformación de las directivas.
              </p>
            </div>

            <Link
              to="/admin/cargos"
              className="admin-inicio-boton btn"
            >
              Gestionar Cargos
            </Link>
          </div>

          {/* DIRECTIVAS */}

          <div className="admin-inicio-tarjeta flex h-full flex-col p-5">
            <div className="mb-5 flex-1">
              <div className="admin-inicio-icono mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold">
                D
              </div>

              <h3 className="text-lg font-bold">
                Gestión de Directivas
              </h3>

              <p className="admin-inicio-texto-suave mt-2 text-sm leading-relaxed">
                Administra las directivas, sus integrantes
                y su vigencia dentro de cada Junta de Vecinos.
              </p>
            </div>

            <Link
              to="/admin/directivas"
              className="admin-inicio-boton btn"
            >
              Gestionar Directivas
            </Link>
          </div>

        </div>
      </section>
    </main>
  )
}

export default AdminInicioPage
