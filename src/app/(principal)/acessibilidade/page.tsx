import FormConfig from "@/src/components/features/acessibilidade/FormConfig";

export default function AcessibilidadePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-titulo1 font-bold text-primaria">
          Personalize sua Experiência
        </h1>
        <p className="text-texto-secundario text-paragrafo">
          Ajuste as configurações abaixo para tornar o aplicativo mais fácil e
          confortável de usar para você.
        </p>
      </section>
      <FormConfig />
    </div>
  );
}
