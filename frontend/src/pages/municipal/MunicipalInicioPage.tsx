
import CerrarSesionButton from '../../components/auth/CerrarSesionButton'

function MunicipalInicioPage() {
  return (
    <main className="municipal-inicio-page">
      <style>{`
        .municipal-inicio-page {
          min-height: 100vh;
          width: 100%;
          padding: 36px 24px;

          display: flex;
          align-items: center;
          justify-content: center;

          background-color: #092318;
          background-image:
            linear-gradient(
              120deg,
              rgba(4, 23, 16, 0.35),
              rgba(4, 23, 16, 0.48)
            ),
            url('/muni-santiago.webp');

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;

          color: #f6efd9;
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .municipal-inicio-page *,
        .municipal-inicio-page *::before,
        .municipal-inicio-page *::after {
          box-sizing: border-box;
        }

        .municipal-inicio-page .municipal-container {
          width: 100%;
          max-width: 1200px;
        }

        .municipal-inicio-page .municipal-panel {
          padding: 38px;
          border-radius: 24px;

          background: rgba(8, 29, 19, 0.74);
          border: 1px solid rgba(215, 172, 50, 0.40);

          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.23);

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .municipal-inicio-page .municipal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }

        .municipal-inicio-page .municipal-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .municipal-inicio-page .municipal-title {
          margin: 0;
          color: #f6efd9;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(32px, 3.5vw, 46px);
          font-weight: 700;
          line-height: 1.2;
        }

        .municipal-inicio-page .municipal-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 18px;
          border-radius: 999px;

          background: rgba(215, 172, 50, 0.16);
          border: 1px solid rgba(215, 172, 50, 0.55);

          color: #edce70;
          font-size: 14px;
          font-weight: 700;
        }

        .municipal-inicio-page .municipal-description {
          margin: 0;
          color: #cbd2c4;
          font-size: 17px;
          line-height: 1.8;
        }

        .municipal-inicio-page .municipal-divider {
          height: 1px;
          margin: 30px 0;
          background: rgba(215, 172, 50, 0.24);
        }

        .municipal-inicio-page .municipal-status {
          display: flex;
          align-items: center;
          gap: 16px;

          padding: 22px;
          border-radius: 16px;

          background: rgba(3, 20, 12, 0.44);
          border: 1px solid rgba(215, 172, 50, 0.22);
        }

        .municipal-inicio-page .municipal-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;

          width: 54px;
          height: 54px;
          border-radius: 15px;

          background: rgba(215, 172, 50, 0.18);
          border: 1px solid rgba(215, 172, 50, 0.35);

          color: #edce70;
          font-size: 25px;
          font-weight: 800;
        }

        .municipal-inicio-page .municipal-status-title {
          margin: 0 0 6px;
          color: #f6efd9;
          font-size: 18px;
          font-weight: 700;
        }

        .municipal-inicio-page .municipal-status-text {
          margin: 0;
          color: #cbd2c4;
          font-size: 14px;
          line-height: 1.6;
        }

        /* BOTÓN CERRAR SESIÓN */

        .municipal-inicio-page .municipal-logout {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .municipal-inicio-page .municipal-logout button {
          min-height: 48px;
          padding: 11px 22px;

          border-radius: 12px;
          border: 1px solid #d7ac32;

          background: rgba(215, 172, 50, 0.22);
          color: #f6efd9;

          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 14px;
          font-weight: 750;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .municipal-inicio-page .municipal-logout button:hover {
          background: #e4c55b;
          color: #102419;
          transform: translateY(-2px);
        }

        .municipal-inicio-page .municipal-logout button:focus-visible {
          outline: 2px solid #f0d375;
          outline-offset: 3px;
        }

        @media (max-width: 650px) {
          .municipal-inicio-page {
            padding: 18px 12px;
            background-attachment: scroll;
          }

          .municipal-inicio-page .municipal-panel {
            padding: 24px;
          }

          .municipal-inicio-page .municipal-header {
            flex-direction: column;
          }

          .municipal-inicio-page .municipal-logout {
            width: 100%;
          }

          .municipal-inicio-page .municipal-logout button {
            width: 100%;
          }
        }
      `}</style>

      <section className="municipal-container">
        <div className="municipal-panel">

          {/* ENCABEZADO */}

          <div className="municipal-header">
            <div>
              <div className="municipal-title-row">
                <h1 className="municipal-title">
                  Panel Municipal
                </h1>

                <span className="municipal-badge">
                  Municipalidad
                </span>
              </div>

              <p className="municipal-description">
                Sesión iniciada correctamente como Usuario Municipal.
              </p>
            </div>

            {/* CERRAR SESIÓN */}

            <div className="municipal-logout">
              <CerrarSesionButton />
            </div>
          </div>

          <div className="municipal-divider" />

          {/* ESTADO DE LA SESIÓN */}

          <div className="municipal-status">
            <div className="municipal-icon">
              M
            </div>

            <div>
              <h2 className="municipal-status-title">
                Bienvenido al Panel Municipal
              </h2>

              <p className="municipal-status-text">
                Has ingresado correctamente al área municipal
                de la plataforma de Junta de Vecinos.
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

export default MunicipalInicioPage
