import React, { useState } from "react";
import { Modal, Form, Input, Button, List, InputNumber, message } from "antd";
import { IPresupuestos, IRecurso } from "../../shared/models/models";

interface Props {
  isModalOpen: boolean;
  onClose: () => void;
  onSubmit: (presupuesto: IPresupuestos) => void;
}

const RegistrarPresupuesto: React.FC<Props> = ({ isModalOpen, onClose, onSubmit }) => {
  const [nombreProyecto, setNombreProyecto] = useState<string>("");
  const [recursos, setRecursos] = useState<IRecurso[]>([]);
  const [subTotalFuturo, setSubTotalFuturo] = useState<number>(0);
  const [subTotalContribuciones, setSubTotalContribuciones] = useState<number>(0);
  const [form] = Form.useForm();

  const handleAddRecurso = (values: Omit<IRecurso, "id">) => {
    const nuevoRecurso = {
      ...values,
    };
    setRecursos((prev) => [...prev, nuevoRecurso]);
    form.resetFields();

    // Actualizar subtotales
    setSubTotalFuturo((prev) => prev + values.cubierto_creando_mi_futuo);
    setSubTotalContribuciones((prev) => prev + values.constribucion_otros);
  };

  const handleRemoveRecurso = (index: number) => {
    const recurso = recursos[index];
    setSubTotalFuturo((prev) => prev - recurso.cubierto_creando_mi_futuo);
    setSubTotalContribuciones((prev) => prev - recurso.constribucion_otros);
    setRecursos((prev) => prev.filter((_, i) => i !== index));
  };
  const handleConfirmRegisterPlan = () => {
    Modal.confirm({
      title: "¿Está seguro de registrar el presupuesto?",
      content: "Una vez registrado, no podrá modificarlo.",
      okText: "Sí",
      cancelText: "No",
      onOk: handleSubmit,
    });
  };
  const handleSubmit = () => {
    if (!nombreProyecto) {
      message.error("Debe ingresar el nombre del proyecto.");
      return;
    }

    if (recursos.length === 0) {
      message.error("Debe agregar al menos un recurso.");
      return;
    }

    const presupuesto: IPresupuestos = {
      nombre_proyecto: nombreProyecto,
      recursos,
      sub_total_creando_mi_futuro: subTotalFuturo,
      sub_total_contribuciones: subTotalContribuciones,
      total: subTotalFuturo + subTotalContribuciones,
    };

    onSubmit(presupuesto);
    message.success("Presupuesto registrado exitosamente.");
    handleReset();
  };

  const handleReset = () => {
    setNombreProyecto("");
    setRecursos([]);
    setSubTotalFuturo(0);
    setSubTotalContribuciones(0);
    onClose();
  };

  return (
    <Modal
      title="Registrar Presupuesto"
      visible={isModalOpen}
      onCancel={handleReset}
      footer={[
        <Button style={{ backgroundColor: "#c42531", color: "white", borderColor: "#c42531" }} key="cancel" onClick={handleReset}>
          Cancelar
        </Button>,
        <Button style={{ backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }} onClick={handleConfirmRegisterPlan}>
          Registrar Presupuesto
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="Nombre del Proyecto Social Comunitario "
          rules={[{ required: true, message: "Este campo es obligatorio." }]}
        >
          <Input
            value={nombreProyecto}
            onChange={(e) => setNombreProyecto(e.target.value)}
          />
        </Form.Item>
      </Form>
      <h4>Recursos</h4>
      <List
        dataSource={recursos}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <Button
                danger
                type="text"
                onClick={() => handleRemoveRecurso(index)}
              >
                Eliminar
              </Button>,
            ]}
          >
            {`${item.descripcion_recurso} - Cantidad: ${item.cantidad}, Cubierto: ${item.cubierto_creando_mi_futuo}, Contribución: ${item.constribucion_otros}`}
          </List.Item>
        )}
      />
      <Form form={form} layout="vertical" onFinish={handleAddRecurso}>
        <Form.Item
          name="descripcion_recurso"
          label="Descripción del Recurso"
          rules={[{ required: true, message: "Este campo es obligatorio." }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="cantidad"
          label="Cantidad"
          rules={[{ required: true, message: "Este campo es obligatorio." }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="cubierto_creando_mi_futuo"
          label="Costo cubierto por Creando mi Futuro Aquí"
          rules={[{ required: true, message: "Este campo es obligatorio." }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="constribucion_otros"
          label="Contribución de otra fuente"
          rules={[{ required: true, message: "Este campo es obligatorio." }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Button style={{ backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }} htmlType="submit">
          Agregar Recurso
        </Button>
      </Form>
      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Subtotal Creando Mi Futuro:</strong> {subTotalFuturo}
        </p>
        <p>
          <strong>Subtotal Contribuciones:</strong> {subTotalContribuciones}
        </p>
        <p>
          <strong>Total:</strong> {subTotalFuturo + subTotalContribuciones}
        </p>
      </div>
    </Modal>
  );
};

export default RegistrarPresupuesto;
