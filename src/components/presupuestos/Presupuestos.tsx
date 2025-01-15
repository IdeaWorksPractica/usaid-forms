import React, { useState, useEffect } from "react";
import {
  getPresupuestos,
  addPresupuesto,
  updatePresupuesto,
} from "../../shared/services/presupuesto.service";
import { IPresupuestos } from "../../shared/models/models";
import { Spin, message, Input, Collapse, Button } from "antd";
import { LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import RegistrarPresupuesto from "./RegistrarPresupuesto";
import { generatePdfPrespuesto } from "./presupuesto.pdf.service";

const { Panel } = Collapse;

export const Presupuestos: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [setPlanloading, setPlanLoading] = useState<boolean>(false);
  const [presupuestos, setPresupuestos] = useState<IPresupuestos[]>([]);
  const [filteredPresupuestos, setFilteredPresupuestos] = useState<
    IPresupuestos[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPresupuesto, setSelectedPresupuesto] =
    useState<IPresupuestos | null>(null);

  const getData = async () => {
    try {
      setLoading(true);
      const data = await getPresupuestos();
      console.log("Presupuestos: ", data);
      setPresupuestos(data);
      setFilteredPresupuestos(data);
    } catch (error) {
      console.error("Error obteniendo los presupuestos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPresupuesto = async (presupuesto: IPresupuestos) => {
    try {
      if (selectedPresupuesto) {
        await updatePresupuesto(selectedPresupuesto.id, presupuesto);
        message.success("Presupuesto actualizado exitosamente.");
      } else {
        await addPresupuesto(presupuesto);
        message.success("Presupuesto registrado exitosamente.");
      }
      setIsModalOpen(false);
      setSelectedPresupuesto(null);
      getData();
    } catch (error) {
      console.error("Error registrando el presupuesto:", error);
      message.error("Ocurrió un error al registrar el presupuesto.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredPresupuestos(
      presupuestos.filter((presupuesto) =>
        presupuesto.nombre_proyecto.toLowerCase().includes(value)
      )
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredPresupuestos(presupuestos); // Restaura la lista completa
  };

  const imprimirPDF = async (presupuesto: IPresupuestos) => {
    setPlanLoading(true);
    await generatePdfPrespuesto(presupuesto);
    setPlanLoading(false);
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
          {filteredPresupuestos.length > 0 ? (
            <Collapse accordion>
              {filteredPresupuestos.map((presupuesto, index) => (
                <Panel header={presupuesto.nombre_proyecto} key={index}>
                  <p>
                    <strong>Subtotal Creando Mi Futuro:</strong> $
                    {presupuesto.sub_total_creando_mi_futuro}
                  </p>
                  <p>
                    <strong>Subtotal Contribuciones:</strong> $
                    {presupuesto.sub_total_contribuciones}
                  </p>
                  <p>
                    <strong>Total:</strong> ${presupuesto.total}
                  </p>
                  <p>
                    <strong>Recursos:</strong>
                  </p>
                  <ul>
                    {presupuesto.recursos.map((recurso, i) => (
                      <li key={i}>
                        {recurso.descripcion_recurso} - Cantidad:{" "}
                        {recurso.cantidad}, Cubierto Creando Mi Futuro: $
                        {recurso.cubierto_creando_mi_futuo}, Contribución Otros:
                        ${recurso.constribucion_otros}
                      </li>
                    ))}
                  </ul>
                  <Button
                    style={{
                      backgroundColor: "#0068b1",
                      color: "white",
                      borderColor: "#0068b1",
                    }}
                    type="primary"
                    onClick={() => {
                      setSelectedPresupuesto(presupuesto);
                      setIsModalOpen(true);
                    }}
                  >
                    Actualizar
                  </Button>
                  <Button
                    onClick={() => imprimirPDF(presupuesto)}
                    type="primary"
                    style={{
                      marginTop: "10px",
                      marginLeft: "10px",
                      backgroundColor: "#0068b1",
                      color: "white",
                      borderColor: "#0068b1",
                    }}
                  >
                    {setPlanloading ? <Spin /> : "Imprimir PDF"}
                  </Button>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <p>No hay presupuestos disponibles.</p>
          )}
        </div>
      )}
      <button className="fab-button" onClick={() => setIsModalOpen(true)}>
        <span className="fab-content">+</span>
      </button>
      <RegistrarPresupuesto
        isModalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPresupuesto(null);
        }}
        onSubmit={handleRegisterPresupuesto}
        presupuesto={selectedPresupuesto}
      />
    </div>
  );
};
