import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, List, DatePicker, message, Spin } from "antd";
import { IPlanActividades, IActividad } from "../../shared/models/models";

interface RegistrarPlanProps {
  isModalOpen: boolean;
  onClose: () => void;
  onRegister: (plan: IPlanActividades) => Promise<void>;
  plan?: IPlanActividades | null; // Nueva prop para recibir el plan a actualizar
}

export const RegistrarPlan: React.FC<RegistrarPlanProps> = ({
  isModalOpen,
  onClose,
  onRegister,
  plan,
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

  useEffect(() => {
    if (plan) {
      setPlanData({
        nombre_proyecto: plan.nombre_proyecto,
        objetivo_proyecto: plan.objetivo_proyecto,
        total_horas: plan.total_horas,
      });
      setActivities(plan.actividades);
      planForm.setFieldsValue({
        nombre_proyecto: plan.nombre_proyecto,
        objetivo_proyecto: plan.objetivo_proyecto,
        total_horas: plan.total_horas,
      });
    }
  }, [plan, planForm]);

  const handleAddActivity = () => {
    activityForm
      .validateFields()
      .then((values) => {
        const actividad: IActividad = {
          ...values,
          fecha_desarrollar: values.fecha_desarrollar.toISOString(),
        };
        setActivities([...activities, actividad]);
        activityForm.resetFields();
        setIsAddingActivity(false);
      })
      .catch((error) => console.error("Error agregando actividad:", error));
  };

  const handleConfirmRegisterPlan = () => {
    Modal.confirm({
      title: plan ? "Actualizar Plan de Actividades" : "Registrar Plan de Actividades",
      content: `¿Está seguro de ${plan ? "actualizar" : "registrar"} el plan?`,
      okText: "Sí",
      cancelText: "No",
      onOk: handleRegisterPlan,
    });
  };

  const handleRegisterPlan = async () => {
    try {
      await planForm.validateFields();

      if (activities.length === 0) {
        message.error("Debe agregar al menos una actividad para registrar el plan.");
        return;
      }

      setIsLoading(true);
      const planToSubmit: IPlanActividades = { ...planData, actividades: activities };

      await onRegister(planToSubmit);

      // Resetea los formularios y estados
      setPlanData({ nombre_proyecto: "", objetivo_proyecto: "", total_horas: 0 });
      setActivities([]);
      planForm.resetFields();
      onClose();
    } catch (error) {
      console.error("Error registrando el plan:", error);
      message.error("Ocurrió un error al registrar el plan.");
    } finally {
      setIsLoading(false);
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
      title={plan ? "Actualizar Plan de Actividades" : "Registrar Plan de Actividades"}
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
            <Button
              key="register"
              style={{ backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
              onClick={handleConfirmRegisterPlan}
              disabled={isLoading}
            >
              {isLoading ? <Spin /> : plan ? "Actualizar Plan" : "Registrar Plan"}
            </Button>,
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
          <List.Item
            actions={[
              <Button
                danger
                type="text"
                onClick={() => setActivities(activities.filter((_, i) => i !== index))}
              >
                Eliminar
              </Button>,
            ]}
          >
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