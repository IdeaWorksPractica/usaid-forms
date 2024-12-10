import React, { useState, useEffect } from "react";
import { getAllPerfiles, createPerfil } from "../../shared/services/perfiles.service";
import { IPerfil } from "../../shared/models/models";
import { Spin, message, Input, Collapse, Button } from "antd";
import { LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import { RegistrarPerfil } from "./RegistrarPerfil";

const { Panel } = Collapse;

export const Perfiles: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [perfiles, setPerfiles] = useState<IPerfil[]>([]);
  const [filteredPerfiles, setFilteredPerfiles] = useState<IPerfil[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredPerfiles(perfiles.filter((perfil) => perfil.nombre_proyecto.toLowerCase().includes(value)));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredPerfiles(perfiles); // Restaura la lista completa
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
          {filteredPerfiles.length > 0 ? (
            <Collapse accordion>
              {filteredPerfiles.map((perfil, index) => (
                <Panel header={perfil.nombre_proyecto} key={index}>
                  <p>
                    <strong>Tipo de Proyecto:</strong> {perfil.tipo_proyecto.join(", ")}
                  </p>
                  <p>
                    <strong>Lugar de Implementación:</strong> {perfil.lugar_implementacion}
                  </p>
                  <p>
                    <strong>Beneficiarios:</strong> {perfil.cant_beneficiarios}
                  </p>
                  <p>
                    <strong>Fechas de Implementación:</strong> {perfil.fechas_implementacion.join(", ")}
                  </p>
                  <p>
                    <strong>Descripción del Problema:</strong> {perfil.descripcion_problema}
                  </p>
                  <p>
                    <strong>Descripción de las Acciones:</strong> {perfil.descripcion_acciones}
                  </p>
                  <p>
                    <strong>Participantes:</strong>
                  </p>
                  <ul>
                    {perfil.participantes.map((participante, i) => (
                      <li key={i}>
                        {participante.nombre_completo} (DNI: {participante.no_dni}, Tel: {participante.no_telefono})
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Líder/Coordinador:</strong> {perfil.lider_coordinador}
                  </p>
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
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegisterPerfil}
      />
    </div>
  );
};
