import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = body.nome || "Cliente BoutBux";
    const email = body.email || null;
    const valor = Number(body.valor);
    const descricao = body.descricao || "Compra na loja";

    // CPF válido para teste/produção temporário
    // Depois o ideal é pedir o CPF real do cliente no checkout
    const cpfCnpj = body.cpfCnpj || "12345678909";

    if (!process.env.ASAAS_API_KEY || !process.env.ASAAS_API_URL) {
      return NextResponse.json(
        { error: "Variáveis do Asaas não configuradas." },
        { status: 500 }
      );
    }

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { error: "Valor inválido para gerar Pix." },
        { status: 400 }
      );
    }

    const headers = {
      "Content-Type": "application/json",
      access_token: process.env.ASAAS_API_KEY,
    };

    const customerRes = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: nome,
        cpfCnpj,
        ...(email ? { email } : {}),
        notificationDisabled: true,
      }),
    });

    const customer = await customerRes.json();

    if (!customerRes.ok) {
      return NextResponse.json({ error: customer }, { status: 400 });
    }

    const paymentRes = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        customer: customer.id,
        billingType: "PIX",
        value: valor,
        dueDate: new Date().toISOString().split("T")[0],
        description: descricao,
      }),
    });

    const payment = await paymentRes.json();

    if (!paymentRes.ok) {
      return NextResponse.json({ error: payment }, { status: 400 });
    }

    const qrRes = await fetch(
      `${process.env.ASAAS_API_URL}/payments/${payment.id}/pixQrCode`,
      {
        method: "GET",
        headers,
      }
    );

    const qr = await qrRes.json();

    if (!qrRes.ok) {
      return NextResponse.json({ error: qr }, { status: 400 });
    }

    return NextResponse.json({
      qrCodeImage: qr.encodedImage,
      copiaCola: qr.payload,
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao gerar Pix" },
      { status: 500 }
    );
  }
}