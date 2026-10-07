import { describe, it, expect } from "vitest";
import { getStudentPerformanceReportAction } from "@/app/actions/admin";

describe("Relatórios de Performance e Acordeão de Certificados", () => {
  it("deve retornar a lista de colaboradores com dados consolidados", async () => {
    const students = await getStudentPerformanceReportAction();
    expect(students).toBeDefined();
    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThan(0);

    const first = students[0];
    expect(first).toHaveProperty("userId");
    expect(first).toHaveProperty("userName");
    expect(first).toHaveProperty("userEmail");
    expect(first).toHaveProperty("storeName");
    expect(first).toHaveProperty("roleTitle");
    expect(first).toHaveProperty("coursesStarted");
    expect(first).toHaveProperty("averageScore");
    expect(first).toHaveProperty("completedCourses");
  });

  it("deve conter cursos concluídos e metadados de certificados para alunos aprovados", async () => {
    const students = await getStudentPerformanceReportAction();

    // Verifica se algum estudante com progresso concluído possui certificados
    const studentWithCertificates = students.find((s) => s.completedCourses && s.completedCourses.length > 0);

    if (studentWithCertificates) {
      expect(studentWithCertificates.completedCourses.length).toBeGreaterThan(0);
      const course = studentWithCertificates.completedCourses[0];
      expect(course).toHaveProperty("courseId");
      expect(course).toHaveProperty("courseTitle");
      expect(course).toHaveProperty("completedAt");
      expect(course).toHaveProperty("certificate");

      const cert = course.certificate;
      expect(cert).toBeDefined();
      if (cert) {
        expect(cert.userName).toBe(studentWithCertificates.userName);
        expect(cert.courseTitle).toBe(course.courseTitle);
        expect(cert.templateId).toBeDefined();
      }
    }
  });

  it("deve calcular médias e status de certificação com integridade matemática", async () => {
    const students = await getStudentPerformanceReportAction();
    for (const student of students) {
      expect(student.averageScore).toBeGreaterThanOrEqual(0);
      expect(student.averageScore).toBeLessThanOrEqual(100);
      expect(student.coursesStarted).toBeGreaterThanOrEqual(student.completedCourses.length);
    }
  });
});
