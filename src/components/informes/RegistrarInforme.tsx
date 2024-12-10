import React, { useState } from "react";
import { Modal, Form, Input, Button, Checkbox, message, Spin, Upload, List } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { IInforme, IParticipante } from "../../shared/models/models";
import { createInforme } from "../../shared/services/informes.service";

const tiposProyectoOptions = [
  "Educación",
  "Prevención de violencia",
  "Medioambiente",
  "Atención a adultos mayores",
  "Salud",
  "Atención a niños",
  "Otro",
];

export const RegistrarInforme: React.FC<{ isModalOpen: boolean; onClose: () => void; }> = ({
  isModalOpen,
  onClose,
}) => {
  const [informeData, setInformeData] = useState<Omit<IInforme, "id" | "participantes" | "fotografias" | "tipo_proyecto">>({
    nombre_proyecto: "",
    lider_coordinador: "",
    descripcion_beneficiarios: { cant_beneficiarios: 0, descripcion_beneficiarios: "" },
    descripcion_mejora: "",
    riesgo_medioambiental: [],
    medidas_reduccion_medioambiental: [],
  });
  const [tipoProyecto, setTipoProyecto] = useState<string[]>([]);
  const [participantes, setParticipantes] = useState<IParticipante[]>([]);
  const [isAddingParticipante, setIsAddingParticipante] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<{ antes: File[]; durante: File[]; despues: File[] }>({
    antes: [],
    durante: [],
    despues: [],
  });

  const [participanteForm] = Form.useForm();
  const [informeForm] = Form.useForm();

  const handleAddParticipante = () => {
    participanteForm
      .validateFields()
      .then((values) => {
        const participante: IParticipante = { ...values };
        setParticipantes([...participantes, participante]);
        participanteForm.resetFields();
        setIsAddingParticipante(false);
      })
      .catch((error) => console.error("Error agregando participante:", error));
  };

  const handleUpload = (category: "antes" | "durante" | "despues", file: File) => {
    setImages((prev) => {
      if (prev[category].length >= 2) {
        message.error(`Solo se permiten 2 imágenes para la categoría "${category}".`);
        return prev;
      }
      return { ...prev, [category]: [...prev[category], file] };
    });
    return false;
  };

  const handleRegisterInforme = async () => {
    try {
      await informeForm.validateFields();

      if (participantes.length === 0) {
        message.error("Debe agregar al menos un participante para registrar el informe.");
        return;
      }

      if (tipoProyecto.length === 0) {
        message.error("Debe seleccionar al menos un tipo de proyecto.");
        return;
      }

      if (
        images.antes.length !== 2 ||
        images.durante.length !== 2 ||
        images.despues.length !== 2
      ) {
        message.error("Debe subir exactamente 2 imágenes para cada categoría (antes, durante, después).");
        return;
      }

      setIsLoading(true);

      await createInforme({
        ...informeData,
        tipo_proyecto: tipoProyecto,
        participantes,
      }, [...images.antes, ...images.durante, ...images.despues]);

      message.success("Informe registrado exitosamente.");

      // Resetear estados
      setInformeData({
        nombre_proyecto: "",
        lider_coordinador: "",
        descripcion_beneficiarios: { cant_beneficiarios: 0, descripcion_beneficiarios: "" },
        descripcion_mejora: "",
        riesgo_medioambiental: [],
        medidas_reduccion_medioambiental: [],
      });
      setParticipantes([]);
      setTipoProyecto([]);
      setImages({ antes: [], durante: [], despues: [] });
      informeForm.resetFields();
      onClose();
    } catch (error) {
      console.error("Error registrando el informe:", error);
      message.error("Ocurrió un error al registrar el informe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Registrar Informe"
      open={isModalOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} style={{ backgroundColor: "#c42531", color: "white" }}>
          Cancelar
        </Button>,
        <Button
          key="register"
          type="primary"
          style={{ backgroundColor: "#0068b1", color: "white" }}
          onClick={handleRegisterInforme}
          disabled={isLoading}
        >
          {isLoading ? <Spin /> : "Registrar Informe"}
        </Button>,
      ]}
      maskClosable={false}
    >
      <Form form={informeForm} layout="vertical">
        <Form.Item
          name="nombre_proyecto"
          label="Nombre del Proyecto"
          rules={[{ required: true, message: "Ingrese el nombre del proyecto." }]}
        >
          <Input
            value={informeData.nombre_proyecto}
            onChange={(e) => setInformeData({ ...informeData, nombre_proyecto: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="tipo_proyecto"
          label="Tipo de Proyecto"
          rules={[{ required: true, message: "Seleccione al menos un tipo de proyecto." }]}
        >
          <Checkbox.Group
            options={tiposProyectoOptions}
            value={tipoProyecto}
            onChange={(values) => setTipoProyecto(values as string[])}
          />
        </Form.Item>
        <Form.Item
          name="lider_coordinador"
          label="Líder / Coordinador"
          rules={[{ required: true, message: "Ingrese el nombre del líder o coordinador." }]}
        >
          <Input
            value={informeData.lider_coordinador}
            onChange={(e) => setInformeData({ ...informeData, lider_coordinador: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="descripcion_beneficiarios"
          label="Descripción de Beneficiarios"
          rules={[{ required: true, message: "Ingrese la descripción de los beneficiarios." }]}
        >
          <Input.TextArea
            value={informeData.descripcion_beneficiarios.descripcion_beneficiarios}
            onChange={(e) =>
              setInformeData({
                ...informeData,
                descripcion_beneficiarios: {
                  ...informeData.descripcion_beneficiarios,
                  descripcion_beneficiarios: e.target.value,
                },
              })
            }
          />
        </Form.Item>
        <Form.Item
          name="cant_beneficiarios"
          label="Cantidad de Beneficiarios"
          rules={[{ required: true, message: "Ingrese la cantidad de beneficiarios." }]}
        >
          <Input
            type="number"
            value={informeData.descripcion_beneficiarios.cant_beneficiarios}
            onChange={(e) =>
              setInformeData({
                ...informeData,
                descripcion_beneficiarios: {
                  ...informeData.descripcion_beneficiarios,
                  cant_beneficiarios: Number(e.target.value),
                },
              })
            }
          />
        </Form.Item>
        <Form.Item
          name="descripcion_mejora"
          label="Descripción de la Mejora"
          rules={[{ required: true, message: "Ingrese la descripción de la mejora." }]}
        >
          <Input.TextArea
            value={informeData.descripcion_mejora}
            onChange={(e) => setInformeData({ ...informeData, descripcion_mejora: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="riesgo_medioambiental"
          label="Riesgos Medioambientales"
          rules={[{ required: true, message: "Ingrese los riesgos medioambientales." }]}
        >
          <Input.TextArea
            value={informeData.riesgo_medioambiental.join(", ")}
            onChange={(e) =>
              setInformeData({ ...informeData, riesgo_medioambiental: e.target.value.split(",") })
            }
          />
        </Form.Item>
        <Form.Item
          name="medidas_reduccion_medioambiental"
          label="Medidas de Reducción Medioambiental"
          rules={[{ required: true, message: "Ingrese las medidas de reducción medioambiental." }]}
        >
          <Input.TextArea
            value={informeData.medidas_reduccion_medioambiental.join(", ")}
            onChange={(e) =>
              setInformeData({
                ...informeData,
                medidas_reduccion_medioambiental: e.target.value.split(","),
              })
            }
          />
        </Form.Item>
        <Form.Item label="Imágenes Antes (2)" required>
          <Upload
            beforeUpload={(file) => handleUpload("antes", file)}
            fileList={images.antes.map((file) => ({ uid: file.name, name: file.name, status: "done" }))}
            listType="picture"
            maxCount={2}
          >
            <Button icon={<UploadOutlined />}>Seleccionar Imágenes</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Imágenes Durante (2)" required>
          <Upload
            beforeUpload={(file) => handleUpload("durante", file)}
            fileList={images.durante.map((file) => ({ uid: file.name, name: file.name, status: "done" }))}
            listType="picture"
            maxCount={2}
          >
            <Button icon={<UploadOutlined />}>Seleccionar Imágenes</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Imágenes Después (2)" required>
          <Upload
            beforeUpload={(file) => handleUpload("despues", file)}
            fileList={images.despues.map((file) => ({ uid: file.name, name: file.name, status: "done" }))}
            listType="picture"
            maxCount={2}
          >
            <Button icon={<UploadOutlined />}>Seleccionar Imágenes</Button>
          </Upload>
        </Form.Item>
        <h4>Participantes</h4>
        <List
          dataSource={participantes}
          renderItem={(participante) => (
            <List.Item>
              <strong>{participante.nombre_completo}</strong> - DNI: {participante.no_dni}, Tel:{" "}
              {participante.no_telefono}
            </List.Item>
          )}
        />
        {!isAddingParticipante ? (
          <div className="w-100 d-flex justify-content-center">
            <Button
              type="dashed"
              onClick={() => setIsAddingParticipante(true)}
              style={{ marginTop: "16px", backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
            >
              Agregar Participante
            </Button>
          </div>
        ) : (
          <Form form={participanteForm} layout="vertical" style={{ marginTop: "16px" }}>
            <Form.Item
              name="nombre_completo"
              label="Nombre Completo"
              rules={[{ required: true, message: "Ingrese el nombre del participante." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="no_dni"
              label="DNI"
              rules={[{ required: true, message: "Ingrese el DNI del participante." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="no_telefono"
              label="Teléfono"
              rules={[{ required: true, message: "Ingrese el teléfono del participante." }]}
            >
              <Input />
            </Form.Item>
            <Button
              onClick={handleAddParticipante}
              style={{ marginRight: "8px", backgroundColor: "#0068b1", color: "white", borderColor: "#0068b1" }}
            >
              Agregar
            </Button>
            <Button
              style={{ backgroundColor: "#c42531", color: "white", borderColor: "#c42531" }}
              onClick={() => setIsAddingParticipante(false)}
            >
              Cancelar
            </Button>
          </Form>
        )}
      </Form>
    </Modal>
  );
  
  
};
