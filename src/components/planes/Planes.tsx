import React, { useState, useEffect } from "react";
import { getAllPlanActividades, createPlanActividad, updatePlanActividad } from "../../shared/services/planes.service";
import { IPlanActividades } from "../../shared/models/models";
import { Spin, message, Input, Collapse, Button } from "antd";
import { LoadingOutlined, CloseOutlined } from "@ant-design/icons";
import { RegistrarPlan } from "./RegistrarPlan";

const { Panel } = Collapse;

export const Planes: React.FC = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [planes, setPlanes] = useState<IPlanActividades[]>([]);
  const [filteredPlanes, setFilteredPlanes] = useState<IPlanActividades[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<IPlanActividades | null>(null);

  const getData = async () => {
    try {
      setLoading(true);
      const data = await getAllPlanActividades();
      console.log('Planes: ', data)
      setPlanes(data);
      setFilteredPlanes(data);
    } catch (error) {
      console.error("Error obteniendo los planes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPlan = async (plan: IPlanActividades) => {
    try {
      if (selectedPlan) {
        await updatePlanActividad(selectedPlan.id, plan);
        message.success("Plan actualizado exitosamente.");
      } else {
        await createPlanActividad(plan);
        message.success("Plan registrado exitosamente.");
      }
      setIsModalOpen(false);
      setSelectedPlan(null);
      getData();
    } catch (error) {
      console.error("Error registrando el plan:", error);
      message.error("Ocurrió un error al registrar el plan.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredPlanes(planes.filter((plan) => plan.nombre_proyecto.toLowerCase().includes(value)));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredPlanes(planes); // Restaura la lista completa
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
            style={{ marginBottom: "20px", width: "100%", fontSize:'1rem' }}
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
          {filteredPlanes.length > 0 ? (
            <Collapse accordion>
              {filteredPlanes.map((plan, index) => (
                <Panel header={plan.nombre_proyecto} key={index}>
                  <p>
                    <strong>Objetivo:</strong> {plan.objetivo_proyecto}
                  </p>
                  <p>
                    <strong>Total de Horas:</strong> {plan.total_horas}
                  </p>
                  <p>
                    <strong>Actividades:</strong>
                  </p>
                  <ul>
                    {plan.actividades.map((actividad, i) => (
                      <li key={i}>
                        {actividad.descripcion} - {actividad.horas_dedicadas} horas (
                        {new Date(actividad.fecha_desarrollar).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }}
                  >
                    Actualizar
                  </Button>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <p>No hay planes disponibles.</p>
          )}
        </div>
      )}
      <button className="fab-button" onClick={() => setIsModalOpen(true)}>
        <span className="fab-content">+</span>
      </button>
      <RegistrarPlan
        isModalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        onRegister={handleRegisterPlan}
        plan={selectedPlan}
      />
    </div>
  );
};