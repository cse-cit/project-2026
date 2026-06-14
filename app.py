from flask import Flask, render_template, request, send_file
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    Image
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime
import os

app = Flask(__name__)


# ================= ROUTES =================

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/form')
def form():
    return render_template("form.html")


@app.route('/generate', methods=['POST'])
def generate():

    college = request.form['college']
    class_info = request.form['class']
    subject = request.form['subject']
    total_classes = int(request.form['total_classes'])

    names = request.form.getlist('name[]')
    attended = request.form.getlist('attended[]')

    data = []

    for i in range(len(names)):

        if names[i].strip() == "":
            continue

        att = int(attended[i])

        percent = 0

        if total_classes > 0:
            percent = (att / total_classes) * 100

        data.append({
            "name": names[i],
            "attended": att,
            "percent": percent
        })

    os.makedirs("output", exist_ok=True)

    filename = f"output/attendance_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

    generate_pdf(
        data,
        college,
        class_info,
        subject,
        total_classes,
        filename
    )

    return send_file(filename, as_attachment=True)


# ================= PAGE NUMBER =================

def add_page_number(canvas, doc):

    canvas.saveState()

    canvas.setFont("Helvetica", 9)

    canvas.drawString(
        500,
        20,
        f"Page {canvas.getPageNumber()}"
    )

    canvas.restoreState()


# ================= PDF FUNCTION =================

def generate_pdf(
        data,
        college,
        class_info,
        subject,
        total_classes,
        filename):

    pdf = SimpleDocTemplate(filename)

    elements = []

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "title",
        fontName="Helvetica-Bold",
        fontSize=22,
        alignment=1,
        textColor=colors.HexColor("#0f172a")
    )

    info_style = ParagraphStyle(
        "info",
        fontName="Helvetica",
        fontSize=11,
        alignment=1,
        textColor=colors.grey
    )

    footer_style = ParagraphStyle(
        "footer",
        fontName="Helvetica-Oblique",
        fontSize=9,
        alignment=1,
        textColor=colors.grey
    )

    summary_style = ParagraphStyle(
        "summary",
        fontName="Helvetica-Bold",
        fontSize=12,
        alignment=1,
        textColor=colors.white
    )

    # DATE

    date_str = datetime.now().strftime(
        "%d %B %Y | %I:%M %p"
    )

    # LOGO

    logo_path = "static/images/logo.png"

    if os.path.exists(logo_path):

        try:

            logo = Image(
                logo_path,
                width=90,
                height=90
            )

            logo.hAlign = "CENTER"

            elements.append(logo)

            elements.append(Spacer(1, 10))

        except:
            pass

    # HEADER

    elements.append(
        Paragraph(
            "ATTENDANCE REPORT",
            title_style
        )
    )

   

    elements.append(Spacer(1, 20))

    # INFORMATION TABLE

    info_table = Table([

        ["College", college],

        ["Class", class_info],

        ["Subject", subject],

        ["Total Classes", str(total_classes)],

        ["Generated On", date_str]

    ], colWidths=[130, 330])

    info_table.setStyle(TableStyle([

        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#1e293b")),

        ('TEXTCOLOR', (0, 0), (0, -1), colors.white),

        ('BACKGROUND', (1, 0), (1, -1), colors.whitesmoke),

        ('GRID', (0, 0), (-1, -1), 1, colors.grey),

        ('BOTTOMPADDING', (0, 0), (-1, -1), 8)

    ]))

    elements.append(info_table)

    elements.append(Spacer(1, 25))

    # SUMMARY

    avg = 0

    if len(data) > 0:
        avg = sum(student["percent"] for student in data) / len(data)

    summary_table = Table([

        [
            Paragraph(
                f"Average Attendance : {avg:.1f}%",
                summary_style
            )
        ]

    ], colWidths=[460])

    summary_table.setStyle(TableStyle([

        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#2563eb")),

        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),

        ('TOPPADDING', (0, 0), (-1, -1), 12),

        ('ALIGN', (0, 0), (-1, -1), 'CENTER')

    ]))

    elements.append(summary_table)

    elements.append(Spacer(1, 30))

    # MAIN TABLE

    table_data = [[

        "S.No",

        "Student Name",

        "Attended",

        "Percentage",

        "Status"

    ]]

    for i, s in enumerate(data, start=1):

        percent = s["percent"]

        if percent >= 75:

            status = Paragraph(
                '<font color="green"><b>Excellent</b></font>',
                styles["Normal"]
            )

        elif percent >= 50:

            status = Paragraph(
                '<font color="orange"><b>Average</b></font>',
                styles["Normal"]
            )

        else:

            status = Paragraph(
                '<font color="red"><b>Critical</b></font>',
                styles["Normal"]
            )

        table_data.append([

            str(i),

            s["name"],

            str(s["attended"]),

            f"{percent:.1f}%",

            status

        ])

    table = Table(
        table_data,
        colWidths=[40, 180, 90, 80, 110]
    )

    style = [

        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),

        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),

        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),

        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),

        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)

    ]

    for row in range(1, len(table_data)):

        if row % 2 == 0:

            style.append(

                ('BACKGROUND',
                 (0, row),
                 (-1, row),
                 colors.whitesmoke)

            )

    table.setStyle(TableStyle(style))

    elements.append(table)

    elements.append(Spacer(1, 35))

        # TOP PERFORMERS

    top_students = sorted(
        data,
        key=lambda x: x["percent"],
        reverse=True
    )

    top_data = [["Top Performers"]]

    for i, student in enumerate(top_students[:3], start=1):

        top_data.append([

            f"{i}. {student['name']} - {student['percent']:.1f}%"

        ])

    top_table = Table(top_data)

    top_table.setStyle(TableStyle([

        ('BACKGROUND', (0, 0), (-1, 0), colors.green),

        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),

        ('GRID', (0, 0), (-1, -1), 1, colors.grey)

    ]))

    elements.append(top_table)

    elements.append(Spacer(1, 40))


    # SIGNATURES

    sign_table = Table([

        [
            "____________________",
            "____________________"
        ],

        [
            "Teacher Signature",
            "HOD Signature"
        ]

    ], colWidths=[240, 240])

    sign_table.setStyle(TableStyle([

        ('ALIGN', (0, 0), (-1, -1), 'CENTER')

    ]))

    elements.append(sign_table)

    elements.append(Spacer(1, 25))

    # FOOTER

    elements.append(

        Paragraph(

            "This report is automatically generated by Attendance List Generator.",

            footer_style

        )

    )

    pdf.build(

        elements,

        onFirstPage=add_page_number,

        onLaterPages=add_page_number

    )


if __name__ == "__main__":
    app.run(debug=True)
