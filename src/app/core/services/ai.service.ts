import { inject, Injectable } from "@angular/core"
import { type Observable, of, delay } from "rxjs"
import { environment } from "../../../environments/environment"
import { HttpClient } from "@angular/common/http"
import { TrelloBoard, TrelloCard, TrelloList } from "../models/trello.model"
import { AIAnalysis } from "../models/aianalisis.interface"

const openAiUrl = environment.openAiUrl;
const openAiToken = environment.openAiToken;
//Prompt chatGPT
// const chatGptPrompt: string = `Analiza el tablero de Trello "${board.name}" con ${lists.length} listas y ${cards.length} tarjetas.`    
// const body = {
//   model: 'gpt-4',
//   messages: [{ role: 'user', content: chatGptPrompt }]
// };

@Injectable({
  providedIn: "root",
})
export class AIService {  

  private http = inject(HttpClient)

  analyzeBoard(board: TrelloBoard, lists: TrelloList[], cards: TrelloCard[]): Observable<AIAnalysis> {
    const analysis = this.generateAdvancedAnalysis(board, lists, cards)
    return of(analysis).pipe(delay(2500)) // Simular tiempo de procesamiento de IA
  }

  private generateAdvancedAnalysis(board: TrelloBoard, lists: TrelloList[], cards: TrelloCard[]): AIAnalysis {
    const workflowSuggestions: string[] = []
    const priorityTasks: string[] = []
    const bottlenecks: string[] = []
    const recommendations: string[] = [] 


    // Análisis de listas y flujo de trabajo
    const doingList = lists.find(
      (l) =>
        l.name.toLowerCase().includes("progreso") ||
        l.name.toLowerCase().includes("doing") ||
        l.name.toLowerCase().includes("desarrollo"),
    )

    const doneList = lists.find(
      (l) =>
        l.name.toLowerCase().includes("completado") ||
        l.name.toLowerCase().includes("done") ||
        l.name.toLowerCase().includes("finalizado"),
    )

    const doingCards = doingList ? cards.filter((c) => c.idList === doingList.id) : []
    const doneCards = doneList ? cards.filter((c) => c.idList === doneList.id) : []

    // Análisis de WIP (Work In Progress)
    if (doingCards.length > 5) {
      workflowSuggestions.push(
        "Considera limitar el trabajo en progreso (WIP) a 3-5 tareas para mejorar el enfoque y reducir el cambio de contexto.",
      )
      bottlenecks.push("Demasiadas tareas en progreso simultáneamente")
    } else if (doingCards.length === 0) {
      workflowSuggestions.push(
        "No hay tareas en progreso. Considera mover algunas tareas pendientes para mantener el flujo de trabajo.",
      )
    }

    // Análisis de tareas vencidas
    const now = new Date()
    const overdueTasks = cards.filter((c) => c.due && new Date(c.due) < now && !c.closed)

    if (overdueTasks.length > 0) {
      workflowSuggestions.push(
        `Hay ${overdueTasks.length} tarea(s) vencida(s). Revisa y replanifica las fechas límite para mantener el momentum del proyecto.`,
      )
      priorityTasks.push(...overdueTasks.slice(0, 3).map((t) => t.name))
    }

    // Análisis de tareas inactivas
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const inactiveTasks = cards.filter(
      (c) => new Date(c.dateLastActivity) < weekAgo && !c.closed && !doneCards.includes(c),
    )

    if (inactiveTasks.length > 0) {
      bottlenecks.push(`${inactiveTasks.length} tarea(s) sin actividad por más de 7 días`)
      recommendations.push(
        "Revisa las tareas inactivas y considera moverlas al backlog o asignar recursos para completarlas.",
      )
    }

    // Análisis de distribución de tareas
    const totalCards = cards.length
    const completionRate = totalCards > 0 ? (doneCards.length / totalCards) * 100 : 0

    if (completionRate < 30) {
      recommendations.push(
        "La tasa de finalización es baja. Considera dividir las tareas grandes en subtareas más manejables.",
      )
    } else if (completionRate > 80) {
      recommendations.push(
        "¡Excelente tasa de finalización! Considera añadir más tareas al backlog para mantener el momentum.",
      )
    }

    // Análisis de fechas límite
    const cardsWithoutDueDate = cards.filter((c) => !c.due && !c.closed)
    if (cardsWithoutDueDate.length > totalCards * 0.4) {
      recommendations.push(
        "Más del 40% de las tareas no tienen fecha límite. Añadir fechas ayuda a priorizar y planificar mejor.",
      )
    }

    // Análisis de descripciones
    const cardsWithoutDescription = cards.filter((c) => !c.desc || c.desc.trim() === "")
    if (cardsWithoutDescription.length > totalCards * 0.3) {
      recommendations.push(
        "Muchas tareas carecen de descripción. Añadir contexto mejora la claridad y reduce malentendidos.",
      )
    }

    // Análisis de etiquetas
    const cardsWithLabels = cards.filter((c) => c.labels && c.labels.length > 0)
    if (cardsWithLabels.length < totalCards * 0.5) {
      recommendations.push(
        "Considera usar más etiquetas para categorizar tareas por prioridad, tipo o área de trabajo.",
      )
    }

    // Sugerencias específicas del tablero
    if (board.name.toLowerCase().includes("bug") || board.name.toLowerCase().includes("error")) {
      workflowSuggestions.push(
        "Para tableros de bugs, considera añadir etiquetas de severidad (crítico, alto, medio, bajo).",
      )
    }

    if (board.name.toLowerCase().includes("marketing")) {
      workflowSuggestions.push(
        "Para proyectos de marketing, considera añadir fechas de lanzamiento y métricas de seguimiento.",
      )
    }

    // Cálculo de productividad
    const productivityScore = Math.min(
      100,
      Math.max(
        0,
        completionRate * 0.4 +
          ((totalCards - inactiveTasks.length) / totalCards) * 100 * 0.3 +
          ((totalCards - overdueTasks.length) / totalCards) * 100 * 0.3,
      ),
    )

    const productivity = {
      score: Math.round(productivityScore),
      trend:
        productivityScore > 75 ? ("up" as const) : productivityScore < 50 ? ("down" as const) : ("stable" as const),
      insights: [
        `Tasa de finalización: ${Math.round(completionRate)}%`,
        `Tareas activas: ${totalCards - inactiveTasks.length}/${totalCards}`,
        `Tareas a tiempo: ${totalCards - overdueTasks.length}/${totalCards}`,
      ],
    }

    // Recomendaciones generales si no hay específicas
    if (recommendations.length === 0) {
      recommendations.push("El tablero está bien organizado. Mantén la consistencia en el flujo de trabajo.")
    }

    if (workflowSuggestions.length === 0) {
      workflowSuggestions.push("El flujo de trabajo actual parece equilibrado. Continúa monitoreando el progreso.")
    }

    // this.sendPrompt(chatGptPrompt);

    return {
      workflowSuggestions,
      priorityTasks,
      bottlenecks,
      recommendations,
      productivity
    }
  }

  sendPrompt(board: TrelloBoard, lists: TrelloList[], cards: TrelloCard[]): Observable<any> {    

    const chatGptPrompt = `Soy un gestor de proyectos que usa Trello. A continuación te doy el estado de mi tablero llamado "${board.name}" con sus listas y tarjetas.

    Dame recomendaciones organizativas para mejorar el flujo de trabajo, identificar tareas prioritarias y otras sugerencias de mejora.

    Tablero:
    ${lists.map(list => {
      const listCards = cards.filter(c => c.idList === list.id).map(c => `- ${c.name}`).join('\n');
      return `Lista: ${list.name}\n${listCards}`;
    }).join('\n\n')}
    `;
    const body = {
      model: 'gpt-4',
      messages: [{ role: 'user', content: chatGptPrompt }],
    };

    console.log(`Sending prompt to OpenAI...`, body);
    console.log(`El prompt:`, chatGptPrompt);
    console.log(`Board`, board);

    return this.http.post(openAiUrl, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiToken}`
      }
    });
  }

  generateTaskSuggestions(boardContext: string): Observable<string[]> {
    const suggestions = [
      "Implementar tests unitarios para componentes críticos",
      "Optimizar imágenes y recursos estáticos",
      "Configurar monitoreo de errores en producción",
      "Documentar APIs y componentes principales",
      "Revisar y actualizar dependencias del proyecto",
    ]

    return of(suggestions).pipe(delay(1000))
  }
}
