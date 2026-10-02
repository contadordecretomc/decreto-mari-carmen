// Closing note shown when the campaign is over (campana.config.json → cerrada).
// Written before the result is known: it tells how the campaign went and what
// each outcome of the vote means.
export function Resolucion() {
  return (
    <section className="resolucion" aria-labelledby="resolucion-titulo">
      <div className="eyebrow">Fin de la campaña</div>
      <h2 id="resolucion-titulo" className="resolucion-titulo">
        Más de medio millón de correos. Ahora decide el Congreso.
      </h2>
      <p>
        En los días previos a la votación, miles de personas han usado esta página para escribir a los 350 diputados y
        diputadas y pedirles que convaliden los dos decretos de vivienda que llevan el nombre de Mari Carmen. Después de
        llenar las calles tras su desahucio, la presión llegó también a sus bandejas de entrada: más de medio millón de
        correos preparados, casi 1.500 por escaño.
      </p>
      <h3 className="resolucion-sub">Qué puede pasar ahora</h3>
      <p className="escenario escenario--si">
        <strong>Si se convalidan los dos decretos,</strong> sus medidas siguen en vigor: protección frente a los desahucios
        hasta 2030, límites al alquiler de temporada y por habitaciones, freno a la compra de vivienda por fondos
        especulativos y renovación automática de los contratos de alquiler. No resuelven todo, pero son las bases de una
        política de vivienda que por fin proteja a la gente que vive de alquiler y no al negocio de quienes especulan con
        sus casas. A partir de ahí, toca defenderlas y ampliarlas.
      </p>
      <p className="escenario escenario--no">
        <strong>Si alguno no se convalida,</strong> decae y sus medidas dejan de aplicarse. Y tendrá responsables: PP, Vox y
        Junts han anunciado su voto en contra. Si lo mantienen, serán ellos quienes dejen vendidas a millones de
        inquilinas e inquilinos frente a los especuladores, los fondos y los desahucios, mientras gente como Mari Carmen
        sigue perdiendo su casa.
      </p>
      <p>
        Pase lo que pase, la lucha por la vivienda no termina con esta votación. Si quieres saber cómo seguir, apúntate aquí
        abajo para recibir información.
      </p>
    </section>
  );
}
