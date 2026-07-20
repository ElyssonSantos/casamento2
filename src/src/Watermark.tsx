import React from "react";
import watermarkImg from "./assets/watermark2.png";

interface WatermarkProps {
  className?: string;
}

const Watermark: React.FC<WatermarkProps> = ({ className = "" }) => {
  const whatsappText = encodeURIComponent(
    "Olá! Vi o site do casamento e gostaria de solicitar um orçamento."
  );

  const whatsappUrl = `https://wa.me/5579998068464?text=${whatsappText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Solicitar um site"
      className={className}
      style={{
        display: "inline-block",
        transition: "transform .2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <img
        src={watermarkImg}
        alt="Site desenvolvido por Elysson Santos"
        style={{
          width: "170px",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </a>
  );
};

export default Watermark;
