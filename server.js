import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/tarefas", async (req, res) => {
	try {
		// Recupera todas as tarefas existentes para calcular o próximo displayOrder
		const existingTasks = await prisma.task.findMany();
		const maxDisplayOrder =
			existingTasks.length > 0
				? Math.max(...existingTasks.map((task) => task.displayOrder))
				: 0;

		// Cria a nova tarefa com o displayOrder incrementado
		const newTask = await prisma.task.create({
			data: {
				name: req.body.name,
				cost: Number.parseFloat(req.body.cost),
				deadline: new Date(req.body.deadline),
				displayOrder: maxDisplayOrder + 1, // Incrementa o displayOrder
			},
		});

		res.status(201).json(newTask);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error creating task" });
	}
});

app.get("/tarefas", async (req, res) => {
	const tasks = await prisma.task.findMany();
	res.status(200).json(tasks);
});

app.put("/tarefas/:id", async (req, res) => {
	await prisma.task.update({
		where: {
			id: req.params.id, // Passar diretamente como string
		},
		data: {
			name: req.body.name,
			cost: Number.parseFloat(req.body.cost), // Certifique-se de converter o custo para float
			deadline: new Date(req.body.deadline),
		},
	});

	res.status(200).json(req.body); // Use 200 para sucesso na atualização
});

app.delete("/tarefas/:id", async (req, res) => {
	const taskId = req.params.id;
	await prisma.task.delete({
		where: {
			id: taskId, // Converter para inteiro
		},
	});

	res.status(200).json({ message: "Tarefa deletada com sucesso!" });
});

app.listen(3000, () => {
	console.log(`Server is running on port: ${PORT}`);
});
