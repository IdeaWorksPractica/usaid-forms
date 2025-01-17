import React, { useState, useEffect } from "react";
import { getAllPerfiles, createPerfil, updatePerfil } from "../../shared/services/perfiles.service";
import { IPerfil } from "../../shared/models/models";
import { Spin, message, Input, Collapse, Button, Select, Row, Col } from "antd";
import { LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import { RegistrarPerfil } from "./RegistrarPerfil";
import { generatePdfPerfil } from "./perfil.pdf.service";
const departamentos = [
  "Atlántida",
  "Choluteca",
  "Colón",
  "Comayagua",
  "Copán",
  "Cortés",
  "El Paraíso",
  "Francisco Morazán",
  "Gracias a Dios",
  "Intibucá",
  "Islas de la Bahía",
  "La Paz",
  "Lempira",
  "Ocotepeque",
  "Olancho",
  "Santa Bárbara",
  "Valle",
  "Yoro",
];

const { Panel } = Collapse;
const { Option } = Select;

export const Perfiles: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [perfiles, setPerfiles] = useState<IPerfil[]>([]);
  const [filteredPerfiles, setFilteredPerfiles] = useState<IPerfil[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>("Todos");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPerfil, setSelectedPerfil] = useState<IPerfil | null>(null);
  const getData = async () => {
    try {
      setLoading(true);
      const data = await getAllPerfiles();
      setPerfiles(data);
      setFilteredPerfiles(data);
    } catch (error) {
      console.error("Error obteniendo los perfiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPerfil = async (perfil: Omit<IPerfil, "id">) => {
    try {
      await createPerfil(perfil);
      message.success("Perfil registrado exitosamente.");
      setIsModalOpen(false);
      getData();
    } catch (error) {
      console.error("Error registrando el perfil:", error);
      message.error("Ocurrió un error al registrar el perfil.");
    }
  };

  const handleUpdatePerfil = async (perfil: IPerfil) => {
    try {
      await updatePerfil(perfil);
      message.success("Perfil actualizado exitosamente.");
      setIsModalOpen(false);
      setSelectedPerfil(null);
      getData();
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      message.error("Ocurrió un error al actualizar el perfil.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, selectedDepartment);
  };

  const handleDepartmentChange = (value: string | null) => {
    setSelectedDepartment(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search: string, department: string | null) => {
    const filtered = perfiles.filter(
      (perfil) =>
        perfil.nombre_proyecto.toLowerCase().includes(search) &&
        (department === "Todos" || !department || perfil.lugar_implementacion === department)
    );
    setFilteredPerfiles(filtered);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedDepartment("Todos");
    setFilteredPerfiles(perfiles); // Restaura la lista completa
  };

  const openEditModal = (perfil: IPerfil) => {
    setSelectedPerfil(perfil); // Selecciona el perfil a editar
    setIsModalOpen(true); // Abre el modal
  };

  const imprimirPDF = async (perfil: IPerfil) => {
    setPdfLoading(true);
    await generatePdfPerfil(perfil);
    setPdfLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

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
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
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
            </Col>
            <Col xs={24} sm={12}>
              <Select
                placeholder="Filtrar por departamento"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="Todos">Todos</Option>
                {departamentos.map((departamento) => (
                  <Option key={departamento} value={departamento}>
                    {departamento}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          {filteredPerfiles.length > 0 ? (
            <Collapse accordion>
              {filteredPerfiles.map((perfil, index) => (
                <Panel header={perfil.nombre_proyecto} key={index}>
                  <p>
                    <strong>Tipo de Proyecto Social Comunitario:</strong>{" "}
                    {perfil.tipo_proyecto.join(", ")}
                  </p>
                  <p>
                    <strong>Lugar de Implementación:</strong>{" "}
                    {perfil.lugar_implementacion}
                  </p>
                  <p>
                    <strong>Cantidad de beneficiarios :</strong>{" "}
                    {perfil.cant_beneficiarios}
                  </p>
                  <p>
                    <strong>Fechas de Implementación:</strong>{" "}
                    {perfil.fechas_implementacion.join(" - ")}
                  </p>
                  <p>
                    <strong>Descripción del Problema:</strong>{" "}
                    {perfil.descripcion_problema}
                  </p>
                  <p>
                    <strong>Descripción de las Acciones:</strong>{" "}
                    {perfil.descripcion_acciones}
                  </p>
                  <p>
                    <strong>Participantes:</strong>
                  </p>
                  <ul>
                    {perfil.participantes.map((participante, i) => (
                      <li key={i}>
                        <strong>{participante.nombre_completo}</strong> - DNI:{" "}
                        {participante.no_dni}, Tel: {participante.no_telefono}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Líder/Coordinador:</strong>{" "}
                    {perfil.lider_coordinador}
                  </p>
                  <p>
                    <strong>Costo Total del Proyecto:</strong>{" "}
                    LPS {perfil.costo_total_psc.costo_total.toFixed(2)}
                  </p>
                  <p>
                    <strong>Valor Financiado:</strong>{" "}
                    LPS {perfil.costo_total_psc.valor_financiado.toFixed(2)}
                  </p>
                  <p>
                    <strong>Otros Aportes:</strong>{" "}
                    LPS {perfil.costo_total_psc.otros_aportes.toFixed(2)}
                  </p>
                  <Button
                    type="primary"
                    onClick={() => openEditModal(perfil)}
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#0068b1",
                      color: "white",
                      borderColor: "#0068b1",
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => imprimirPDF(perfil)}
                    type="primary"
                    style={{
                      marginTop: "10px",
                      marginLeft: "10px",
                      backgroundColor: "#0068b1",
                      color: "white",
                      borderColor: "#0068b1",
                    }}
                  >
                    {pdfLoading ? <Spin /> : "Imprimir PDF"}
                  </Button>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <p>No hay perfiles disponibles.</p>
          )}
        </div>
      )}
      <button className="fab-button" onClick={() => setIsModalOpen(true)}>
        <span className="fab-content">+</span>
      </button>
      <RegistrarPerfil
        isModalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPerfil(null); // Limpia el perfil seleccionado
        }}
        onRegister={handleRegisterPerfil}
        onUpdate={handleUpdatePerfil}
        perfil={selectedPerfil} // Pasa el perfil seleccionado
      />
    </div>
  );
};
