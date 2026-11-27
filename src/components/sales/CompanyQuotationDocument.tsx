'use client';

import React from 'react';
import { DemoQuotation } from '@/types/demo';

interface CompanyQuotationDocumentProps {
  quotation: DemoQuotation;
  brand?: 'Explast' | 'PrintBox';
  className?: string;
}

export function CompanyQuotationDocument({
  quotation,
  brand: brandProp,
  className = '',
}: CompanyQuotationDocumentProps) {
  const activeBrand = brandProp || quotation.brand || 'PrintBox';
  const isPrintbox = activeBrand === 'PrintBox';

  // Format creation date as DD/MM/YYYY
  const formatDate = (isoString?: string) => {
    if (!isoString) return '06/10/2026';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoString;
    }
  };

  const documentDate = formatDate(quotation.created_at);

  // Bank Account details matching company standard
  const bankName = quotation.bank_name || 'STATE BANK OF MAURITIUS LTD (SBM)';
  const bankAccount = quotation.bank_account_number || '503 0000 134 9609';

  return (
    <div
      className={`bg-white text-black p-8 sm:p-12 max-w-[820px] mx-auto font-sans leading-normal border border-zinc-200 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none ${className}`}
    >
      {/* 1. COMPANY HEADER & LOGO */}
      <div className="flex flex-col items-center justify-center text-center mb-6">
        {isPrintbox ? (
          /* PRINTBOX LOGO WITH 4-PETAL FAN */
          <div className="flex flex-col items-center">
            <svg width="60" height="42" viewBox="0 0 60 42" fill="none" className="mb-1">
              {/* Petal 1 (Pink / Magenta) */}
              <path
                d="M30 38C30 38 20 28 17 18C15 11 19 6 25 6C30 6 30 14 30 38Z"
                fill="#D82B7D"
              />
              {/* Petal 2 (Orange-Red) */}
              <path
                d="M30 38C30 38 26 25 28 14C29 7 35 4 41 6C46 8 43 16 30 38Z"
                fill="#F26A36"
              />
              {/* Petal 3 (Lime Green) */}
              <path
                d="M30 38C30 38 36 26 42 18C47 12 53 13 55 19C57 24 50 28 30 38Z"
                fill="#8EC63F"
              />
              {/* Petal 4 (Forest Green) */}
              <path
                d="M30 38C30 38 42 30 49 26C55 23 58 27 57 32C55 37 47 38 30 38Z"
                fill="#3F9B53"
              />
            </svg>

            <span className="text-2xl font-bold tracking-tight text-[#169691] leading-none lowercase">
              printbox
            </span>
            <span className="text-[11px] font-semibold text-[#1F544D] mt-0.5 tracking-tight">
              Your Paper Partner
            </span>
            <a
              href={`mailto:${quotation.contact_email || 'sweety-marketing@printbox.mu'}`}
              className="text-[11px] text-[#169691] hover:underline mt-1 inline-block"
            >
              {quotation.contact_email || 'sweety-marketing@printbox.mu'}
            </a>
            <p className="text-[11px] font-semibold text-black mt-0.5">
              BRN : C25221679 – VAT : 28399017
            </p>
          </div>
        ) : (
          /* EXPLAST LOGO & HEADER */
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded bg-[#119A94] text-white flex items-center justify-center font-bold text-lg">
                E
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#119A94] uppercase">
                explast
              </span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-600 tracking-tight">
              Flexible Packaging Specialists • Extrusion, Printing & Converting
            </span>
            <a
              href="mailto:sales@explast.mu"
              className="text-[11px] text-[#119A94] hover:underline mt-1 inline-block"
            >
              sales@explast.mu
            </a>
            <p className="text-[11px] font-semibold text-black mt-0.5">
              BRN : C07002542 – VAT : 22003841
            </p>
          </div>
        )}
      </div>

      {/* 2. DATE (RIGHT ALIGNED) */}
      <div className="text-right text-xs sm:text-sm font-bold text-black mb-2">
        Date: {documentDate}
      </div>

      {/* 3. CUSTOMER'S DETAILS (BOXED RECTANGLE) */}
      <div className="border border-black mb-7">
        <div className="border-b border-black px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-black bg-zinc-100/60">
          Customer's Details
        </div>
        <div className="p-2.5 sm:p-3 text-xs sm:text-sm text-black space-y-1">
          <p className="font-bold uppercase tracking-wide">
            {quotation.client_name || 'CIRRUS SCARLET COMPANY LTD'}
          </p>
          {quotation.contact_phone ? (
            <p className="font-bold">{quotation.contact_phone}</p>
          ) : (
            <p className="font-bold">5 8068596</p>
          )}
        </div>
      </div>

      {/* 4. DOCUMENT TITLE (CENTERED & UNDERLINED) */}
      <div className="text-center my-6">
        <h2 className="text-sm sm:text-base font-bold text-black underline tracking-tight">
          {quotation.project_name?.toLowerCase().startsWith('order for')
            ? quotation.project_name
            : `Order for ${quotation.project_name || 'BANDITOS Take Away'}`}
        </h2>
      </div>

      {/* 5. PRICING & ITEM TABLE */}
      <div className="overflow-x-auto mb-7">
        <table className="w-full border-collapse border border-black text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="border border-black px-3 py-2 text-left font-bold text-black">
                Item
              </th>
              <th className="border border-black px-3 py-2 text-center font-bold text-black w-24 sm:w-28">
                Quantity
              </th>
              <th className="border border-black px-3 py-2 text-right font-bold text-black w-24 sm:w-28">
                Unit Price
              </th>
              <th className="border border-black px-3 py-2 text-right font-bold text-black w-28 sm:w-32">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {quotation.items && quotation.items.length > 0 ? (
              quotation.items.map((item, idx) => {
                const quantityLabel =
                  item.quantity_unit === 'units'
                    ? `${item.quantity} pcs`
                    : `${item.quantity.toLocaleString()} ${item.quantity_unit}`;

                return (
                  <tr key={item.id || idx} className="border-b border-black">
                    <td className="border border-black px-3 py-2 text-black">
                      {item.description}
                      {item.dimensions_summary && !item.description.includes(item.dimensions_summary) && (
                        <span> – {item.dimensions_summary}</span>
                      )}
                    </td>
                    <td className="border border-black px-3 py-2 text-center text-black font-mono">
                      {quantityLabel}
                    </td>
                    <td className="border border-black px-3 py-2 text-right text-black font-mono">
                      Rs {item.unit_price_mur.toFixed(2)}
                    </td>
                    <td className="border border-black px-3 py-2 text-right text-black font-mono">
                      Rs {item.subtotal_mur.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="border-b border-black">
                <td className="border border-black px-3 py-2 text-black">
                  Printed Take Away Small – 11.5 x 18 x 5.7 cm
                </td>
                <td className="border border-black px-3 py-2 text-center text-black font-mono">
                  2500 pcs
                </td>
                <td className="border border-black px-3 py-2 text-right text-black font-mono">
                  Rs 8.25
                </td>
                <td className="border border-black px-3 py-2 text-right text-black font-mono">
                  Rs 20,625
                </td>
              </tr>
            )}

            {/* VAT (15%) ROW */}
            <tr className="border-b border-black">
              <td className="border border-black px-3 py-1.5 text-black">
                Vat ({quotation.tax_rate_percent || 15}%)
              </td>
              <td className="border border-black px-3 py-1.5"></td>
              <td className="border border-black px-3 py-1.5"></td>
              <td className="border border-black px-3 py-1.5 text-right text-black font-mono">
                Rs {quotation.tax_mur.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {/* GRAND TOTAL ROW */}
            <tr>
              <td className="border border-black px-3 py-2 font-bold text-black underline">
                Total
              </td>
              <td className="border border-black px-3 py-2"></td>
              <td className="border border-black px-3 py-2"></td>
              <td className="border border-black px-3 py-2 text-right font-bold text-black font-mono underline">
                Rs {quotation.total_mur.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. PAYMENT TERMS & CONDITION */}
      <div className="text-xs sm:text-sm text-black space-y-2 mb-6">
        <p className="font-bold underline">Payment Terms & Condition:</p>
        <ol className="list-decimal list-inside space-y-1 pl-1">
          <li>Quotation valid for 30 days</li>
          <li>Expect a variation of more or less 3% on quantity ordered.</li>
          <li>
            Payment can be done by IB Transfer, Card, Juice or Cheque
            <br />
            <span className="inline-block mt-0.5">Account details:</span>
          </li>
        </ol>
      </div>

      {/* 7. BANK ACCOUNT DETAILS */}
      <div className="text-xs sm:text-sm text-black space-y-0.5">
        <p className="font-bold underline">{bankName}</p>
        <p className="font-bold tracking-wider">{bankAccount}</p>
      </div>
    </div>
  );
}
