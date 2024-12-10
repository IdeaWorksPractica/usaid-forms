import React, { useState } from "react";
import { Modal, Form, Input, Button, List, DatePicker, message, Popconfirm, Spin } from "antd";
import { IPlanActividades, IActividad } from "../../shared/models/models";

interface RegistrarPlanProps {
  isModalOpen: boolean;
  onClose: () => void;
  onRegister: (plan: IPlanActividades) => Promise<void>; // Suponemos que `onRegister` es una operación asíncrona
}

export const RegistrarPlan: React.FC<RegistrarPlanProps> = ({
  isModalOpen,
  onClose,
  onRegister,
}) => {
  const [planData, setPlanData] = useState<Omit<IPlanActividades, "actividades">>({
    nombre_proyecto: "",
    objetivo_proyecto: "",
    total_horas: 0,
  });
  const [activities, setActivities] = useState<IActividad[]>([]);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activityForm] = Form.useForm();
  const [planForm] = Form.useForm();

  const handleAddActivity = () => {
    activityForm
      .validateFields()
      .then((values) => {
        const actividad: IActividad = {
          ...values,
          fecha_desarrollar: values.fecha_desarrollar.toISOString(), // Convierte la fecha a ISO string
        };
        setActivities([...activities, actividad]);
        activityForm.resetFields();
        setIsAddingActivity(false);
      })
      .catch((error) => console.error("Error agregando actividad:", error));
  };
  

  const handleRegisterPlan = async () => {
    try {
      await planForm.validateFields();

      if (activities.length === 0) {
        message.error("Debe agregar al menos una actividad para registrar el plan.");
        return;
      }

      setIsLoading(true); // Activa el spinner en el botón
      const plan: IPlanActividades = { ...planData, actividades: activities };
      console.log("Plan registrado exitosamente:", plan);

      await onRegister(plan); // Llama al prop `onRegister`
      message.success("Plan registrado exitosamente.");

      // Resetea los formularios y estados
      setPlanData({ nombre_proyecto: "", objetivo_proyecto: "", total_horas: 0 });
      setActivities([]);
      planForm.resetFields();
      onClose();
    } catch (error) {
      console.error("Error registrando el plan:", error);
      message.error("Ocurrió un error al registrar el plan.");
    } finally {
      setIsLoading(false); // Desactiva el spinner
    }
  };

  const handleCancel = () => {
    if (
      planForm.isFieldsTouched() ||
      activityForm.isFieldsTouched() ||
      activities.length > 0
    ) {
      Modal.confirm({
        title: "Confirmar cierre",
        content: "Hay datos sin guardar, ¿realmente desea cerrar? Se perderán todos los datos.",
        okText: "Sí, cerrar",
        cancelText: "Cancelar",
        onOk: () => {
          setPlanData({ nombre_proyecto: "", objetivo_proyecto: "", total_horas: 0 });
          setActivities([]);
          planForm.resetFields();
          activityForm.resetFields();
          onClose();
        },
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      title="Registrar Plan de Actividades"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={
        !isAddingActivity ? (
          [
            <Button
              key="cancel"
              onClick={handleCancel}
              style={{ backgroundColor: "#c42531", color: "white", borderColor: "#c42531" }}
            >
              Cancelar
            </Button>,
            <Popconfirm
              key="confirm"
              title="¿Está seguro de registrar el plan?"
              onConfirm={handleRegisterPlan}
              okText="Sí"
              cancelText="No"
            >
              <Button
                key="register"
                type="primary"
                style={{ backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
                disabled={isLoading}
              >
                {isLoading ? <Spin /> : "Registrar Plan"}
              </Button>
            </Popconfirm>,
          ]
        ) : null
      }
      maskClosable={false}
    >
      <Form form={planForm} layout="vertical">
        <Form.Item
          name="nombre_proyecto"
          label="Nombre del Proyecto"
          rules={[{ required: true, message: "Ingrese el nombre del proyecto." }]}
        >
          <Input
            value={planData.nombre_proyecto}
            onChange={(e) => setPlanData({ ...planData, nombre_proyecto: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="objetivo_proyecto"
          label="Objetivo del Proyecto"
          rules={[{ required: true, message: "Ingrese el objetivo del proyecto." }]}
        >
          <Input.TextArea
            value={planData.objetivo_proyecto}
            onChange={(e) => setPlanData({ ...planData, objetivo_proyecto: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="total_horas"
          label="Total de Horas"
          rules={[{ required: true, message: "Ingrese el total de horas." }]}
        >
          <Input
            type="number"
            value={planData.total_horas}
            onChange={(e) => setPlanData({ ...planData, total_horas: parseInt(e.target.value, 10) || 0 })}
          />
        </Form.Item>
      </Form>

      <h4>Actividades</h4>
      <List
        dataSource={activities}
        renderItem={(activity, index) => (
          <List.Item>
            <strong>{activity.descripcion}</strong> - {activity.horas_dedicadas} horas
          </List.Item>
        )}
      />

      {!isAddingActivity ? (
        <div className="w-100 d-flex justify-content-center">
          <Button
            type="dashed"
            onClick={() => setIsAddingActivity(true)}
            style={{ marginTop: "16px", backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
          >
            Agregar Actividad
          </Button>
        </div>
      ) : (
        <Form form={activityForm} layout="vertical" style={{ marginTop: "16px" }}>
          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: "Ingrese la descripción de la actividad." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="horas_dedicadas"
            label="Horas Dedicadas"
            rules={[{ required: true, message: "Ingrese las horas dedicadas." }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="fecha_desarrollar"
            label="Fecha a Desarrollar"
            rules={[{ required: true, message: "Ingrese la fecha de desarrollo." }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Button
            onClick={handleAddActivity}
            style={{ marginRight: "8px", backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
          >
            Agregar
          </Button>
          <Button
            style={{ backgroundColor: "#c42531", color: "white", borderColor: "#c42531" }}
            onClick={() => setIsAddingActivity(false)}
          >
            Cancelar
          </Button>
        </Form>
      )}
    </Modal>
  );
};
