import React from "react";
import watermarkImg from "@/assets/watermark2.png";

interface WatermarkProps {
  className?: string;
}

const Watermark: React.FC<WatermarkProps> = ({ className = "" }) => {
  const whatsappText = encodeURIComponent("Olá! Vim do site Delícias da Milly! Quero um site pra mim!");
  const whatsappUrl = `https://wa.me/5579998068464?text=${whatsappText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-transform hover:scale-105 ${className}`}
      title="Criar site personalizado no WhatsApp"
    >
      <img
        src={watermarkImg}
        alt="Site desenvolvido por: ELYSSON Santos"
        className="w-40 h-20 object-contain drop-shadow-sm rounded-lg"
      />
    </a>
  );
};

export default Watermark;
