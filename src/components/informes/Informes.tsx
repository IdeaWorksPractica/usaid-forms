import React, { useState, useEffect } from "react";
import { getAllInformes } from "../../shared/services/informes.service";
import { IInforme } from "../../shared/models/models";
import { Spin, Input, Collapse, Button, Modal } from "antd";
import { LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import { RegistrarInforme } from "./RegistrarInforme";
import { generatePdfInforme } from "./informes.pdf.servicio";

const { Panel } = Collapse;

export const Informes: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [informes, setInformes] = useState<IInforme[]>([]);
  const [filteredInformes, setFilteredInformes] = useState<IInforme[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedInforme, setSelectedInforme] = useState<IInforme | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllInformes();
      console.log(data);
      setInformes(data);
      setFilteredInformes(data);
    } catch (error) {
      console.error("Error obteniendo los informes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredInformes(
      informes.filter((informe) =>
        informe.nombre_proyecto.toLowerCase().includes(value)
      )
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredInformes(informes);
  };

  const imprimirPDF = async (informe: IInforme) => {
    setPdfLoading(true);
    await generatePdfInforme(informe);
    setPdfLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageClick = (url: string) => {
    setPreviewImage(url);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleOpenUpdateModal = (informe: IInforme) => {
    setSelectedInforme(informe);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInforme(null);
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
  const customSpinner = <LoadingOutlined style={{ fontSize: 18, color: "white" }} spin />;
  return (
    <div>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin indicator={antIcon} />
        </div>
      ) : (
        <div>
          <Input
            placeholder="Buscar por nombre de proyecto"
            value={searchTerm}
            onChange={handleSearch}
            style={{ marginBottom: "20px", width: "100%", fontSize: "1rem" }}
            suffix={
              searchTerm && (
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={clearSearch}
                  style={{ color: "#000" }}
                />
              )
            }
          />
          {filteredInformes.length > 0 ? (
            <Collapse accordion>
              {filteredInformes.map((informe) => (
                <Panel header={`${informe.nombre_proyecto}`} key={informe.id}>
                  <p>
                    <strong>Nombre del Proyecto:</strong>{" "}
                    {informe.nombre_proyecto}
                  </p>
                  <p>
                    <strong>Tipo de Proyecto:</strong>{" "}
                    {informe.tipo_proyecto.join(", ")}
                  </p>
                  <p>
                    <strong>Líder/Coordinador:</strong>{" "}
                    {informe.lider_coordinador}
                  </p>
                  <p>
                    <strong>Beneficiarios:</strong>{" "}
                    {informe.descripcion_beneficiarios.cant_beneficiarios} -{" "}
                    {
                      informe.descripcion_beneficiarios
                        .descripcion_beneficiarios
                    }
                  </p>
                  <p>
                    <strong>Mejora Descripción:</strong>{" "}
                    {informe.descripcion_mejora}
                  </p>
                  <p>
                    <strong>Riesgos Medioambientales:</strong>{" "}
                    {informe.riesgo_medioambiental.join(", ")}
                  </p>
                  <p>
                    <strong>Medidas de Reducción Medioambientales:</strong>{" "}
                    {informe.medidas_reduccion_medioambiental.join(", ")}
                  </p>
                  <div className="row">
                    <div className="col-md-12">
                      <h5>Antes</h5>
                      <div className="d-flex flex-wrap">
                        {informe.fotografias.antes.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Antes ${i + 1}`}
                            style={{
                              cursor: "pointer",
                              width: "45%",
                              margin: "5px",
                            }}
                            onClick={() => handleImageClick(url)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h5>Durante</h5>
                      <div className="d-flex flex-wrap">
                        {informe.fotografias.durantes.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Durante ${i + 1}`}
                            style={{
                              cursor: "pointer",
                              width: "45%",
                              margin: "5px",
                            }}
                            onClick={() => handleImageClick(url)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h5>Después</h5>
                      <div className="d-flex flex-wrap">
                        {informe.fotografias.despues.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Después ${i + 1}`}
                            style={{
                              cursor: "pointer",
                              width: "45%",
                              margin: "5px",
                            }}
                            onClick={() => handleImageClick(url)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p>
                    <strong>Participantes:</strong>
                  </p>
                  <ul>
                    {informe.participantes.map((participante, i) => (
                      <li key={i}>
                        {participante.nombre_completo} (DNI:{" "}
                        {participante.no_dni}, Tel: {participante.no_telefono})
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="primary"
                    onClick={() => handleOpenUpdateModal(informe)}
                    style={{ marginTop: "10px" }}
                  >
                    Actualizar
                  </Button>
                  <Button
                    onClick={() => imprimirPDF(informe)}
                    type="primary"
                    style={{
                      marginTop: "10px",
                      marginLeft: "10px",
                      backgroundColor: "#0068b1",
                      color: "white",
                      borderColor: "#0068b1",
                    }}
                  >
                    {pdfLoading ?  <Spin indicator={customSpinner} /> : "Imprimir PDF"}
                  </Button>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <p>No hay informes disponibles.</p>
          )}
        </div>
      )}
      <button className="fab-button" onClick={() => setIsModalOpen(true)}>
        <span className="fab-content">+</span>
      </button>
      <RegistrarInforme
        isModalOpen={isModalOpen}
        onClose={handleModalClose}
        informe={selectedInforme}
        onRegister={fetchData}
        onUpdate={fetchData}
      />
      <Modal
        visible={!!previewImage}
        footer={null}
        onCancel={handleClosePreview}
        centered
      >
        <img
          src={previewImage as string}
          alt="Vista previa"
          style={{ width: "100%" }}
        />
      </Modal>
    </div>
  );
};
